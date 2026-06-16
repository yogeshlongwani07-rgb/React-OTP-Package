import { useState, useRef, useEffect, useCallback } from "react";

/**
 * OtpInput — A dynamic, accessible OTP input component for React.
 *
 * @param {object}   props
 * @param {number}   [props.length=6]              Number of OTP digits.
 * @param {string}   [props.value]                 Controlled value (optional).
 * @param {function} [props.onChange]              Called on every keystroke with the current OTP string.
 * @param {function} [props.onComplete]            Called when all fields are filled. Receives the complete OTP string.
 * @param {boolean}  [props.autoFocus=true]        Auto-focus the first input on mount.
 * @param {boolean}  [props.disabled=false]        Disable all inputs.
 * @param {boolean}  [props.isAlphaNumeric=false]  Allow letters as well as digits. Default is digits-only.
 * @param {string}   [props.placeholder='']        Placeholder character shown in each empty box.
 * @param {string}   [props.inputClassName='']     Extra CSS class(es) applied to every input box.
 * @param {object}   [props.inputStyle={}]         Inline styles applied to every input box.
 * @param {string}   [props.containerClassName=''] Extra CSS class(es) applied to the wrapper div.
 * @param {object}   [props.containerStyle={}]     Inline styles applied to the wrapper div.
 * @param {boolean}  [props.showSeparator=false]   Show a dash separator between inputs.
 * @param {React.ReactNode} [props.separator]      Custom separator element between inputs.
 * @param {boolean}  [props.shakeOnError=true]     Shake inputs when `hasError` is true.
 * @param {boolean}  [props.hasError=false]        Marks inputs as erroneous (red border + shake).
 * @param {boolean}  [props.showResend=false]      Render built-in Resend button with countdown timer.
 * @param {number}   [props.resendTimeout=30]      Countdown in seconds before the Resend button becomes active.
 * @param {function} [props.onResend]              Called when the user clicks the Resend button.
 * @param {string}   [props.resendLabel='Resend OTP'] Label for the built-in Resend button.
 */
function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  isAlphaNumeric = false,
  placeholder = "",
  inputClassName = "",
  inputStyle = {},
  containerClassName = "",
  containerStyle = {},
  showSeparator = false,
  separator,
  shakeOnError = true,
  hasError = false,
  showResend = false,
  resendTimeout = 30,
  onResend,
  resendLabel = "Resend OTP",
}) {
  // ─── internal state ───────────────────────────────────────────────────────
  const [internalOtp, setInternalOtp] = useState(() => Array(length).fill(""));
  const [shake, setShake] = useState(false);
  const [timer, setTimer] = useState(resendTimeout);
  const [timerDone, setTimerDone] = useState(false);
  const refs = useRef([]);

  // Decide whether we are controlled or uncontrolled
  const isControlled = value !== undefined;

  // Derive the array of chars from the controlled value, or use internal state
  const otp = isControlled
    ? Array(length)
        .fill("")
        .map((_, i) => (value[i] ?? ""))
    : internalOtp;

  // ─── helpers ──────────────────────────────────────────────────────────────
  const isValidChar = (char) =>
    isAlphaNumeric ? /^[a-zA-Z0-9]$/.test(char) : /^\d$/.test(char);

  const notifyChange = useCallback(
    (newOtp) => {
      const str = newOtp.join("");
      onChange?.(str);
      if (newOtp.every((v) => v !== "")) {
        onComplete?.(str);
      }
    },
    [onChange, onComplete]
  );

  const updateOtp = useCallback(
    (newOtp) => {
      if (!isControlled) setInternalOtp(newOtp);
      notifyChange(newOtp);
    },
    [isControlled, notifyChange]
  );

  // ─── event handlers ───────────────────────────────────────────────────────
  function handleChange(e, index) {
    const raw = e.target.value;
    // If user typed more than one char (fast input), take only the last valid one
    const char = raw.split("").reverse().find(isValidChar) ?? "";

    const newOtp = [...otp];
    newOtp[index] = char;
    updateOtp(newOtp);

    if (char) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[index] !== "") {
        newOtp[index] = "";
        updateOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        updateOtp(newOtp);
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowRight") refs.current[index + 1]?.focus();
    if (e.key === "ArrowLeft") refs.current[index - 1]?.focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const pattern = isAlphaNumeric ? /[^a-zA-Z0-9]/g : /\D/g;
    const pasted = e.clipboardData
      .getData("text")
      .replace(pattern, "")
      .slice(0, length);

    if (!pasted) return;

    const newOtp = Array(length).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    updateOtp(newOtp);

    const nextIndex = Math.min(pasted.length, length) - 1;
    refs.current[nextIndex]?.focus();
  }

  // ─── shake on error ───────────────────────────────────────────────────────
  useEffect(() => {
    if (hasError && shakeOnError) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [hasError, shakeOnError]);

  // ─── auto-focus ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── resend timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showResend) return;
    if (timer === 0) { setTimerDone(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, showResend]);

  function handleResend() {
    if (!timerDone) return;
    setTimer(resendTimeout);
    setTimerDone(false);
    if (!isControlled) setInternalOtp(Array(length).fill(""));
    refs.current[0]?.focus();
    onResend?.();
  }

  // ─── separator element ────────────────────────────────────────────────────
  const defaultSeparator = (
    <span style={{ margin: "0 4px", fontSize: "1.2rem", color: "#888" }}>
      —
    </span>
  );
  const sep = separator ?? defaultSeparator;

  // ─── styles ───────────────────────────────────────────────────────────────
  const baseContainerStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    ...containerStyle,
  };

  const baseInputStyle = {
    width: "44px",
    height: "48px",
    fontSize: "1.5rem",
    textAlign: "center",
    border: hasError ? "2px solid #e53e3e" : "2px solid #cbd5e0",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
    background: disabled ? "#f7fafc" : "#fff",
    cursor: disabled ? "not-allowed" : "text",
    ...inputStyle,
  };

  const shakeStyle = `
    @keyframes otpShake {
      0%   { transform: translateX(0); }
      15%  { transform: translateX(-6px); }
      30%  { transform: translateX(6px); }
      45%  { transform: translateX(-5px); }
      60%  { transform: translateX(5px); }
      75%  { transform: translateX(-3px); }
      90%  { transform: translateX(3px); }
      100% { transform: translateX(0); }
    }
    .otp-swift-shake { animation: otpShake 0.45s ease-in-out; }
  `;

  return (
    <div>
      <style>{shakeStyle}</style>
      <div
        className={containerClassName}
        style={baseContainerStyle}
        role="group"
        aria-label="OTP input"
      >
        {otp.map((val, index) => (
          <span key={index} style={{ display: "inline-flex", alignItems: "center" }}>
            <input
              ref={(el) => { refs.current[index] = el; }}
              type="text"
              inputMode={isAlphaNumeric ? "text" : "numeric"}
              pattern={isAlphaNumeric ? "[a-zA-Z0-9]" : "[0-9]"}
              autoComplete="one-time-code"
              aria-label={`OTP digit ${index + 1}`}
              maxLength={1}
              value={val}
              placeholder={placeholder}
              disabled={disabled}
              className={[
                inputClassName,
                shake ? "otp-swift-shake" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={baseInputStyle}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
            />
            {showSeparator && index < length - 1 && sep}
          </span>
        ))}
      </div>

      {showResend && (
        <div style={{ marginTop: "12px", fontSize: "0.875rem", color: "#555" }}>
          {timerDone ? (
            <button
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "#3182ce",
                cursor: "pointer",
                fontWeight: 600,
                padding: 0,
                fontSize: "0.875rem",
              }}
            >
              {resendLabel}
            </button>
          ) : (
            <span>
              {resendLabel} in{" "}
              <strong style={{ color: "#2d3748" }}>{timer}s</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default OtpInput;
