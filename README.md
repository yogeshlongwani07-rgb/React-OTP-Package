# react-otp-package

A lightweight, dynamic, and fully-accessible OTP input component for React.

[![npm version](https://img.shields.io/npm/v/react-otp-package.svg)](https://www.npmjs.com/package/react-otp-package)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-otp-package)](https://bundlephobia.com/package/react-otp-package)
[![license](https://img.shields.io/npm/l/react-otp-package)](LICENSE)

---

## ✨ Features

- 🔢 **Any length** — 4, 6, 8 digits, or whatever your backend needs
- ⌨️ **Smart keyboard navigation** — Arrow keys, Backspace, and Tab all work naturally
- 📋 **Paste support** — paste a full OTP and every field fills instantly
- ♿ **Accessible** — `role="group"`, `aria-label` per input, `inputMode="numeric"` for mobile keyboards
- 📱 **Mobile-friendly** — numeric/text keyboard pops up automatically
- 🎨 **Fully customisable** — pass your own `className` or inline `style` for inputs and the container
- ❌ **Error state + shake animation** — one prop drives both the red border and the shake
- ⏱️ **Built-in resend timer** — opt-in countdown with a callback; no extra state to manage
- 🔤 **Alpha-numeric mode** — accept letters too for PIN-style codes
- 🪶 **Tiny** — ~2 KB gzipped, zero runtime dependencies beyond React

---

## 📦 Installation

````bash
npm install react-otp-package

Requires **React ≥ 17**.

---

## 🚀 Quick Start

```jsx
import { useState } from "react";
import OtpInput from "react-otp-package";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");

  return (
    <OtpInput
      length={6}
      onChange={setOtp}
      onComplete={(code) => console.log("Complete OTP:", code)}
    />
  );
}
````

---

## 📖 Examples

### Basic 6-digit OTP

```jsx
<OtpInput length={6} onComplete={(code) => verifyOtp(code)} />
```

### Controlled component

```jsx
const [otp, setOtp] = useState("");

<OtpInput length={6} value={otp} onChange={setOtp} />;
```

### Show error with shake animation

```jsx
const [hasError, setHasError] = useState(false);

<OtpInput
  length={6}
  hasError={hasError}
  onComplete={(code) => {
    if (code !== correctOtp) setHasError(true);
  }}
/>;
{
  hasError && <p style={{ color: "red" }}>Incorrect OTP. Try again.</p>;
}
```

### With built-in resend timer

```jsx
<OtpInput
  length={6}
  showResend
  resendTimeout={30}
  onResend={() => {
    // call your API to re-send the code
    sendOtpToUser();
  }}
  resendLabel="Resend code"
/>
```

### Custom styling

```jsx
<OtpInput
  length={4}
  inputStyle={{
    width: "56px",
    height: "56px",
    fontSize: "1.75rem",
    borderRadius: "12px",
    border: "2px solid #7c3aed",
  }}
  containerStyle={{ gap: "12px" }}
/>
```

### With separator between inputs

```jsx
<OtpInput
  length={6}
  showSeparator
  separator={<span style={{ color: "#999" }}>·</span>}
/>
```

### Alpha-numeric PIN (e.g. gift card codes)

```jsx
<OtpInput
  length={8}
  isAlphaNumeric
  placeholder="·"
  onComplete={(code) => redeemCode(code)}
/>
```

### Full real-world example

```jsx
import { useState } from "react";
import OtpInput from "react-otp-package";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error" | null

  async function handleComplete(code) {
    const ok = await verifyWithServer(code);
    setStatus(ok ? "success" : "error");
  }

  async function handleResend() {
    await requestNewOtp();
    setOtp("");
    setStatus(null);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Enter your 6-digit code</h2>

      <OtpInput
        length={6}
        value={otp}
        onChange={setOtp}
        onComplete={handleComplete}
        hasError={status === "error"}
        showResend
        resendTimeout={60}
        onResend={handleResend}
        resendLabel="Resend OTP"
      />

      {status === "success" && <p style={{ color: "green" }}>✅ Verified!</p>}
      {status === "error" && (
        <p style={{ color: "red" }}>❌ Wrong code, try again.</p>
      )}
    </div>
  );
}
```

---

## ⚙️ Props

| Prop                 | Type                    | Default        | Description                                           |
| -------------------- | ----------------------- | -------------- | ----------------------------------------------------- |
| `length`             | `number`                | `6`            | Number of OTP input boxes                             |
| `value`              | `string`                | —              | Controlled value. Use together with `onChange`        |
| `onChange`           | `(otp: string) => void` | —              | Called on every keystroke with the current OTP string |
| `onComplete`         | `(otp: string) => void` | —              | Called when all fields are filled                     |
| `autoFocus`          | `boolean`               | `true`         | Auto-focus the first box on mount                     |
| `disabled`           | `boolean`               | `false`        | Disable all inputs                                    |
| `isAlphaNumeric`     | `boolean`               | `false`        | Allow letters as well as digits                       |
| `placeholder`        | `string`                | `''`           | Placeholder character for each empty box              |
| `inputClassName`     | `string`                | `''`           | Extra CSS class(es) on every input                    |
| `inputStyle`         | `object`                | `{}`           | Inline styles for every input                         |
| `containerClassName` | `string`                | `''`           | Extra CSS class(es) on the wrapper div                |
| `containerStyle`     | `object`                | `{}`           | Inline styles for the wrapper div                     |
| `showSeparator`      | `boolean`               | `false`        | Render a separator between inputs                     |
| `separator`          | `ReactNode`             | `—`            | Custom separator element                              |
| `shakeOnError`       | `boolean`               | `true`         | Animate a shake when `hasError` is `true`             |
| `hasError`           | `boolean`               | `false`        | Marks inputs with a red border and triggers shake     |
| `showResend`         | `boolean`               | `false`        | Render built-in Resend button with countdown          |
| `resendTimeout`      | `number`                | `30`           | Countdown in seconds before Resend becomes active     |
| `onResend`           | `() => void`            | —              | Called when the user clicks Resend                    |
| `resendLabel`        | `string`                | `'Resend OTP'` | Label for the Resend button / countdown text          |

---

## 🎹 Keyboard Support

| Key            | Action                                                  |
| -------------- | ------------------------------------------------------- |
| `0–9` / `a–z`  | Enter the character and move focus to the next field    |
| `Backspace`    | Clear current field; if empty, clear and focus previous |
| `ArrowRight`   | Move focus to next field                                |
| `ArrowLeft`    | Move focus to previous field                            |
| `Ctrl/Cmd + V` | Paste: fills all fields from clipboard text             |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

Yogesh Longwani
