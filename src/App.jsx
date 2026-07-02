import React, { useEffect, useRef, useState } from "react";
// 1. 이미지를 올바른 경로에서 불러옵니다.
import pogen1 from "./images/pogen1.png";
import pogen2 from "./images/pogen2.png";
import logoImg from "./images/logoImg.jpeg";
import convert from "./images/convert.jpeg";
import gallery from "./images/gallery.jpeg";

function nowStr() {
  const d = new Date();
  const h = d.getHours();
  const period = h < 12 ? "오전" : "오후";
  const hh = h % 12 === 0 ? 12 : h % 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${period} ${hh}:${mm}`;
}

// 2. SVG 대신 가져온 이미지 변수(pogen1)를 사용하도록 수정했습니다.
function Mascot() {
  return (
    <img 
      src={pogen1} 
      alt="마스코트" 
      width="112"
      height="112" 
      style={{ objectFit: 'contain' }}
    />
  );
}

const DEFAULT_QUEST = {
  title: "해야 할 일 하나만 메모에 적기",
  description: "머릿속 걱정을 메모 밖으로 꺼내면 다음 행동 문턱이 낮아져요.",
  xp: 10,
};

function MissionCard({ stage, lighter, quest, onAccept, onLighter, onVerify }) {
  const [fillWidth, setFillWidth] = useState(0);
  const q = quest || DEFAULT_QUEST;
  const xpLabel = q.xp ? ` (+${q.xp} xp)` : "";

  useEffect(() => {
    if (stage === "verifying") {
      setFillWidth(0);
      const t = setTimeout(() => setFillWidth(100), 50);
      return () => clearTimeout(t);
    }
  }, [stage]);

  if (stage === "suggest") {
    return (
      <div className="mission-card">
        <div className="mission-tag suggest">토닥 미션</div>
        <div className="mission-title">{q.title}</div>
        <div className="mission-desc">
          {lighter
            ? "오늘 있었던 일 한 줄만 떠올려봐도 충분해요."
            : q.description || DEFAULT_QUEST.description}
        </div>
        <div className="mission-buttons">
          <button className="pill-btn" onClick={onAccept}>
            {lighter ? "가벼운 미션 해볼래요" : "이 미션 해볼래요"}
          </button>
          {!lighter && (
            <button className="pill-btn_light" onClick={onLighter}>
              조금 더 가볍게
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === "inprogress") {
    return (
      <div className="mission-card">
        <div className="mission-tag progress">미션 중</div>
        <div className="mission-title">{q.title}</div>
        <div className="mission-desc">{q.description || DEFAULT_QUEST.description}</div>
        <button className="verify-btn" onClick={onVerify}>
          미션 인증하기{xpLabel}
        </button>
      </div>
    );
  }

  if (stage === "verifying") {
    return (
      <div className="mission-card">
        <div className="mission-tag progress">미션 중</div>
        <div className="mission-title">{q.title}</div>
        <div className="mission-desc">{q.description || DEFAULT_QUEST.description}</div>
        <div className="progress-row">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: fillWidth + "%" }} />
          </div>
          <div className="progress-label">인증 중</div>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="mission-card">
        <div className="done-wrap">
          <div>
            <div className="mission-tag done">미션 완료{xpLabel}</div>
            <div className="mission-title">{q.title}</div>
            <div className="mission-desc">{q.description || DEFAULT_QUEST.description}</div>
          </div>
          <div className="stamp stamp-blue">
            미션
            <br />
            완료
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Gemini 응답이 실패했을 때만 사용하는 예비 답변
const FALLBACK_REPLIES = [
  "천천히 얘기해줘, 듣고 있어.",
  "그럴 수 있어. 무리하지 않아도 돼.",
  "오늘은 그것만으로도 충분해.",
];

const API_BASE =  "http://168.107.56.230:8787";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [level, setLevel] = useState(1);
  const [missionsDone, setMissionsDone] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [toast, setToast] = useState("");

  const scrollRef = useRef(null);
  const idRef = useRef(0);
  const missionsDoneRef = useRef(0);
  const levelRef = useRef(1);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    missionsDoneRef.current = missionsDone;
  }, [missionsDone]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const pushMessage = (msg) => {
    setMessages((prev) => [...prev, { id: nextId(), ...msg }]);
  };

  const addBot = (text, withLabel = false) => {
    pushMessage({ kind: "bot", text, label: withLabel, time: nowStr() });
  };

  const addUser = (text) => {
    pushMessage({ kind: "user", text, time: nowStr() });
  };

  const addMissionCard = (stage, quest = DEFAULT_QUEST) => {
    pushMessage({ kind: "mission", stage, lighter: false, quest });
  };

  const presentQuest = (quest) => {
    setMessages((prev) => {
      for (let i = prev.length - 1; i >= 0; i -= 1) {
        if (prev[i].kind === "mission") {
          if (prev[i].stage === "inprogress") {
            return prev;
          }
          if (prev[i].stage === "suggest") {
            const copy = [...prev];
            copy[i] = { ...copy[i], quest, lighter: false };
            return copy;
          }
          break;
        }
      }
      return [...prev, { id: nextId(), kind: "mission", stage: "suggest", lighter: false, quest }];
    });
  };

  const updateLastMission = (patch) => {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i -= 1) {
        if (copy[i].kind === "mission") {
          copy[i] = { ...copy[i], ...patch };
          break;
        }
      }
      return copy;
    });
  };

  // 처음 접속했을 때 포근이의 인사말만 보여준다.
  // (예전엔 "사람 연락도 싫고 답답해."를 자동으로 대신 입력해줬는데,
  //  이제는 사용자가 직접 자기 이야기를 입력하도록 자동 입력을 없앴다.)
  useEffect(() => {
    const t1 = setTimeout(() => addBot("안녕, 나는 포근이야! 오늘 기분이 어때?", true), 300);
    return () => {
      clearTimeout(t1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, cameraOpen]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  };

  const handleAccept = () => {
    addUser("어떻게 하는거야?");
    setTimeout(() => updateLastMission({ stage: "inprogress" }), 400);
  };

  const handleLighter = () => {
    addUser("조금 더 가볍게 해줘.");
    updateLastMission({ lighter: true });
  };

  const handleVerifyClick = () => setCameraOpen(true);
  const handleCloseCamera = () => setCameraOpen(false);

  const handleShutter = () => {
    showToast("사진이 저장되었어요");
    setTimeout(() => {
      setCameraOpen(false);
      updateLastMission({ stage: "verifying" });
      setTimeout(() => {
        updateLastMission({ stage: "done" });
        setMissionsDone((m) => m + 1);
        setTimeout(() => {
          addBot("오늘도 한 걸음 나아갔어! 잘했어 :)", true);
          setLevel((l) => l + 1);
        }, 500);
      }, 2000);
    }, 350);
  };

  const handleSend = async () => {
    const text = textInput.trim();
    if (!text) return;
    addUser(text);
    setTextInput("");

    const history = messagesRef.current
      .filter((m) => m.kind === "bot" || m.kind === "user")
      .map((m) => ({ role: m.kind, text: m.text }));

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "chat request failed");
      }

      const data = await res.json();
      addBot(data.reply || FALLBACK_REPLIES[0]);

      // 새 퀘스트가 왔으면 카드에 반영한다 (진행 중인 미션은 건드리지 않고,
      // 제안만 되어있던 카드는 새 퀘스트로 교체한다).
      if (data.quest && data.quest.title) {
        presentQuest({
          title: data.quest.title,
          description: data.quest.description,
          xp: data.quest.xp,
        });
      }

      // 위기 신호가 감지되면, 모델이 즉흥적으로 만든 문구 대신 고정된 안내문을 보여준다.
      if (data.crisis) {
        addBot(data.crisisNotice || FALLBACK_REPLIES[0]);
        showToast("상담사에게 알림이 전달되었어요");
        // TODO: 실제 서비스에서는 여기서 상담사 알림(이메일/슬랙/대시보드 등) API를 호출해야 한다.
        console.warn("[위기 알림] level:", data.crisis.level);
      }
    } catch (err) {
      console.error("Gemini 응답 실패:", err);
      if (err.message && err.message !== "chat request failed") {
        addBot(err.message);
        return;
      }
      addBot(FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]);
    }
  };

  const handleChipCount = () => {
    addUser("오늘 내가 수행한 미션은 몇개야?");
    setTimeout(() => addBot(`지금까지 총 ${missionsDoneRef.current}개의 미션을 수행했어!`), 500);
  };

  const handleChipGrowth = () => {
    addUser("나는 지금 얼마나 성장했어?");
    setTimeout(
      () => addBot(`포근이와 함께 LEVEL ${levelRef.current}까지 왔어. 조금씩 성장하고 있어!`),
      500,
    );
  };

  return (
    <div className="device">
      <div className="phone">
        <div className="header">
        <img 
            src={logoImg} 
            alt="토닥토닥 로고" 
            height="32" // 헤더 높이에 맞게 적절히 조절하세요 (예: 24 ~ 36)
            style={{ objectFit: 'contain', display: 'block' }} 
          />          
          <div className="character-row">
            <Mascot />
            <div className="character-name">아기 포근이</div>
            <div className="level-badge">LEVEL {level}</div>
          </div>
          <div className="divider" />
        </div>

        <div className="chat-scroll" ref={scrollRef}>
          {messages.map((msg) => {
            if (msg.kind === "bot") {
              return (
                <React.Fragment key={msg.id}>
                  {msg.label && <div className="bot-label">포근이</div>}
                  <div className="row bot">
                    <div className="bubble bot">{msg.text}</div>
                    <div className="timestamp">{msg.time}</div>
                  </div>
                </React.Fragment>
              );
            }
            if (msg.kind === "user") {
              return (
                <div className="row user" key={msg.id}>
                  <div className="timestamp">{msg.time}</div>
                  <div className="bubble user">{msg.text}</div>
                </div>
              );
            }
            if (msg.kind === "mission") {
              return (
                <MissionCard
                  key={msg.id}
                  stage={msg.stage}
                  lighter={msg.lighter}
                  quest={msg.quest}
                  onAccept={handleAccept}
                  onLighter={handleLighter}
                  onVerify={handleVerifyClick}
                />
              );
            }
            return null;
          })}
        </div>

        <div className="chips">
          <button className="chip" onClick={handleChipCount}>
            오늘 내가 수행한 미션은 몇개야?
          </button>
          <button className="chip" onClick={handleChipGrowth}>
            나는 지금 얼마나 성장했어?
          </button>
        </div>

        <div className="input-bar">
          <div className="input-shell">
            <input
              type="text"
              placeholder="메시지 보내기"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  handleSend();
                }
              }}
            />
          </div>
          <button className="send-btn" onClick={handleSend} aria-label="보내기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h16M13 5l7 7-7 7"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={`camera-modal ${cameraOpen ? "open" : ""}`}>
          <div className="camera-top">
            <button onClick={handleCloseCamera} aria-label="닫기">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 5l14 14M19 5L5 19"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button onClick={handleCloseCamera} aria-label="다음">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12h16M13 5l7 7-7 7"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="camera-viewport" />
          <div className="camera-bottom">
            <div className="gallery-strip">
              {[1, 2, 3, 4, 5].map((n) => (
                <img key={n} src={`https://picsum.photos/seed/a${n}/80/80`} alt="" />
              ))}
            </div>
            <div className="camera-controls">
              <span className="icon-btn">
                <img 
                  src={gallery} 
                  alt="갤러리" 
                  width="45" 
                  height="45" 
                  style={{ objectFit: 'contain', display: 'block' }} 
                />
              </span>
              <button className="shutter" onClick={handleShutter} />
              <span className="icon-btn">
                <img 
                  src={convert} 
                  alt="화면 전환" 
                  width="55" 
                  height="55" 
                  style={{ objectFit: 'contain', display: 'block' }} 
                />
              </span>
            </div>
          </div>
        </div>

        <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
      </div>

      <div className="nav-bar">
        <span className="nav-icon nav-back" />
        <span className="nav-icon nav-home" />
        <span className="nav-icon nav-recent" />
      </div>
    </div>
  );
}
