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

function MissionCard({ stage, lighter, onAccept, onLighter, onVerify }) {
  const [fillWidth, setFillWidth] = useState(0);

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
        <div className="mission-title">해야 할 일 하나만 메모에 적기</div>
        <div className="mission-desc">
          {lighter
            ? "오늘 있었던 일 한 줄만 떠올려봐도 충분해요."
            : "머릿속 걱정을 메모 밖으로 꺼내면 다음 행동 문턱이 낮아져요."}
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
        <div className="mission-title">해야 할 일 하나만 메모에 적기</div>
        <div className="mission-desc">
          머릿속 걱정을 메모 밖으로 꺼내면 다음 행동 문턱이 낮아져요.
        </div>
        <button className="verify-btn" onClick={onVerify}>
          미션 인증하기
        </button>
      </div>
    );
  }

  if (stage === "verifying") {
    return (
      <div className="mission-card">
        <div className="mission-tag progress">미션 중</div>
        <div className="mission-title">해야 할 일 하나만 메모에 적기</div>
        <div className="mission-desc">
          머릿속 걱정을 메모 밖으로 꺼내면 다음 행동 문턱이 낮아져요.
        </div>
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
            <div className="mission-tag done">미션 완료</div>
            <div className="mission-title">해야 할 일 하나만 메모에 적기</div>
            <div className="mission-desc">
              머릿속 걱정을 메모 밖으로 꺼내면 다음 행동 문턱이 낮아져요.
            </div>
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

const REPLIES = [
  "천천히 얘기해줘, 듣고 있어.",
  "그럴 수 있어. 무리하지 않아도 돼.",
  "오늘은 그것만으로도 충분해.",
];

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

  const addMissionCard = (stage) => {
    pushMessage({ kind: "mission", stage, lighter: false });
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

  useEffect(() => {
    const t1 = setTimeout(() => addBot("안녕, 나는 포근이야! 오늘 기분이 어때?", true), 300);
    const t2 = setTimeout(() => addUser("사람 연락도 싫고 답답해."), 900);
    const t23 = setTimeout(() => addMissionCard("suggest"), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t23);
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

  const handleSend = () => {
    const text = textInput.trim();
    if (!text) return;
    addUser(text);
    setTextInput("");
    setTimeout(() => addBot(REPLIES[Math.floor(Math.random() * REPLIES.length)]), 500);
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
                if (e.key === "Enter") handleSend();
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
                  src={galleryImg} 
                  alt="갤러리" 
                  width="24" 
                  height="24" 
                  style={{ objectFit: 'contain', display: 'block' }} 
                />
              </span>
              <button className="shutter" onClick={handleShutter} />
              <span className="icon-btn">
                <img 
                  src={convertImg} 
                  alt="화면 전환" 
                  width="24" 
                  height="24" 
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