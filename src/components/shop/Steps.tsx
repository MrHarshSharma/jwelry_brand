const STEPS = ["Cart", "Details", "WhatsApp", "Confirmed"];

/** Checkout progress. `current` is the index of the active step. */
export default function Steps({ current }: { current: number }) {
  return (
    <div className="steps">
      {STEPS.map((label, i) => (
        <div key={label} style={{ display: "contents" }}>
          {i > 0 && <div className="step-line" />}
          <div className={`step${i < current ? " done" : i === current ? " active" : ""}`}>
            <div className="step-circle">{i < current ? <i className="fas fa-check" /> : i + 1}</div>
            <span>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
