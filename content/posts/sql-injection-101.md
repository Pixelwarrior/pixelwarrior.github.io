+++
date = '2025-12-04T22:09:50-06:00'
draft = false
title = 'SQL Injection 101: Understanding the Basics'
author = 'yad0'
tags = ['web-security', 'sql-injection', 'vulnerabilities', 'tutorial']
categories = ['Web Security']
+++

SQL Injection (SQLi) remains one of the most critical web application vulnerabilities, consistently ranking in the OWASP Top 10. In this post, we'll explore what SQL injection is, how it works, and how to protect against it.

## What is SQL Injection?

SQL Injection is a code injection technique that exploits vulnerabilities in an application's database layer. Attackers can manipulate SQL queries by inserting malicious SQL code through user input fields.

## How Does It Work?

Consider a simple login form that constructs an SQL query like this:

```sql
SELECT * FROM users WHERE username = 'admin' AND password = 'password123';
```

If the application doesn't properly sanitize input, an attacker could enter:

```
Username: admin' --
Password: (anything)
```

This transforms the query into:

```sql
SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'anything';
```

The `--` comments out the rest of the query, effectively bypassing authentication!

## Types of SQL Injection

### 1. Classic SQLi (In-Band)

The attacker uses the same channel to inject SQL code and retrieve results.

```python
# Vulnerable Python code
username = request.form['username']
query = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(query)
```

### 2. Blind SQLi

The attacker doesn't see direct output but can infer information based on application behavior.

```sql
SELECT * FROM products WHERE id = 1 AND 1=1; -- Returns normally
SELECT * FROM products WHERE id = 1 AND 1=2; -- Returns nothing
```

### 3. Out-of-Band SQLi

Uses different channels for injection and data retrieval (e.g., DNS or HTTP requests).

## Real-World Example: Union-Based Attack

```sql
' UNION SELECT null, username, password FROM users --
```

This technique combines results from the original query with a malicious query to extract data from other tables.

## Prevention Techniques

### 1. Parameterized Queries (Prepared Statements)

**Best Practice:**

```python
# Secure Python code using parameterized queries
username = request.form['username']
cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
```

```php
// Secure PHP code with PDO
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
$stmt->execute(['username' => $username]);
```

### 2. Input Validation

Whitelist allowed characters and validate input length:

```javascript
function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_-]{3,20}$/;
    return regex.test(username);
}
```

### 3. Least Privilege Principle

Database users should only have permissions they need:

```sql
-- Don't do this
GRANT ALL PRIVILEGES ON *.* TO 'webapp'@'localhost';

-- Do this instead
GRANT SELECT, INSERT, UPDATE ON mydb.users TO 'webapp'@'localhost';
```

### 4. Web Application Firewalls (WAF)

Deploy WAFs to detect and block common SQL injection patterns.

## Testing for SQL Injection

**Warning:** Only test applications you have permission to test!

### Basic Test Payloads

```
'
''
`
``
,
"
""
/
//
\
\\
;
' OR '1
' OR 1 -- -
" OR "" = "
" OR 1 = 1 -- -
' OR '' = '
```

### Tools for Testing

- **SQLMap**: Automated SQL injection tool
- **Burp Suite**: Web security testing platform
- **OWASP ZAP**: Open-source web app scanner

## SQLMap Example

```bash
# Basic SQLMap usage
sqlmap -u "http://example.com/page?id=1" --dbs

# With authentication
sqlmap -u "http://example.com/page?id=1" --cookie="SESSIONID=abc123" --dbs

# Dump specific database
sqlmap -u "http://example.com/page?id=1" -D mydb --tables
```

## Key Takeaways

1. **Never trust user input** - Always validate and sanitize
2. **Use parameterized queries** - This is your primary defense
3. **Apply least privilege** - Limit database permissions
4. **Keep software updated** - Patch known vulnerabilities
5. **Monitor and log** - Detect suspicious database activity

## Resources

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security/sql-injection)
- [HackerOne SQLi Reports](https://hackerone.com/hacktivity?querystring=sqli)

## Conclusion

SQL Injection remains a critical threat, but it's entirely preventable with proper coding practices. The key is to never construct SQL queries using string concatenation with user input. Always use parameterized queries and implement multiple layers of defense.

Stay curious, stay secure!
