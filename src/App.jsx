import { useState } from "react";

function App() {

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {

    setLoading(true);

    const response = await fetch(
      "https://communication-intelligence-api.onrender.com/communication-intelligence/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-default-key"
        },
        body: JSON.stringify({
          message_text: message
        })
      }
    );

    const data = await response.json();

    setResult(data);
    setLoading(false);
  }

  function setExample(text) {
    setMessage(text);
  }

  return (
    <div style={{fontFamily:"Arial",padding:"60px",maxWidth:"700px",margin:"auto"}}>

      <h1>🧠 ToneCheck</h1>

      <p>Check a message before you send it.</p>

      <div style={{marginBottom:"10px"}}>

        <button onClick={()=>setExample("Fine. Do whatever you want.")}>
          Passive aggressive
        </button>

        <button onClick={()=>setExample("Why are you ignoring me?")} style={{marginLeft:"10px"}}>
          Angry text
        </button>

        <button onClick={()=>setExample("Send me the file ASAP.")} style={{marginLeft:"10px"}}>
          Work message
        </button>

      </div>

      <textarea
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        placeholder="Paste your message here..."
        style={{width:"100%",height:"120px",padding:"10px",fontSize:"16px"}}
      />

      <br/><br/>

      <button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Message"}
      </button>

      {result && (
        <div style={{marginTop:"30px",background:"#f3f6ff",padding:"20px",borderRadius:"10px"}}>

          <p><b>Tone:</b> {result.tone}</p>
          <p><b>Risk Score:</b> {result.risk_score}</p>
           <p><b>Risk Level:</b> {result.risk_level}</p>
          <p><b>Confidence:</b> {result.confidence}</p>
          <p><b>Advisory:</b> {result.advisory}</p>

        </div>
      )}

      <pre>{JSON.stringify(result, null, 2)}</pre>
      <p style={{marginTop:"50px",fontSize:"14px",color:"#888"}}>
        Built by @MangoMind Labs
      </p>

    </div>
  );
}

export default App;
