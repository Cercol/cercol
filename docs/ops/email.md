# Email

Two independent systems, and confusing them is the usual source of
trouble.

**Resend** sends everything the application sends: magic links, email
change confirmations, the daily brief, the weekly digest, the group
nudge. From `noreply@cercol.team`, configured in `worker/src/emails.js`
and authenticated with the `RESEND_API_KEY` secret on the `cercol-api`
Worker.

**Purelymail** receives mail and holds the mailboxes, since 2026-08-18.
Before that it was a self-hosted Stalwart on the Hetzner box shared with
topquaranta; that instance is retired (stopped, moved to
`/root/stalwart-retired-2026-08-18` with a full export, and
`mail.topquaranta.cat` answers 410). Purelymail is not in the
application's path at all: if it is down, the product still sends email.

| | Purelymail | Resend |
|---|---|---|
| Role | receiving, mailboxes | transactional sending |
| Hosting | SaaS, pay as you go | SaaS |
| Protocols | IMAP, SMTP, POP3, web | REST |
| Addresses | `hello@`, `miquel@`, `admin@cercol.team` | `noreply@cercol.team` |
| Config | Purelymail account, `PURELYMAIL_API_KEY` for the credit line in the daily brief | `RESEND_API_KEY` |

Mailbox access: IMAP `imap.purelymail.com:993` and SMTP
`smtp.purelymail.com:465`, both SSL/TLS, username = full address. The
same account also hosts the topquaranta.cat mailboxes.

## DNS, as actually published

DNS for `cercol.team` is at Cloudflare (moved from Porkbun on
2026-08-17). Verified against the live zone on 2026-08-18:

```
cercol.team.          MX   50 mailserver.purelymail.com.
cercol.team.          TXT  "v=spf1 include:_spf.purelymail.com include:_spf.resend.com ~all"
_dmarc.cercol.team.   CNAME dmarcroot.purelymail.com.
resend._domainkey.cercol.team.        TXT  (Resend's RSA key)
purelymail1._domainkey.cercol.team.   CNAME key1.dkimroot.purelymail.com.
purelymail2._domainkey.cercol.team.   CNAME key2.dkimroot.purelymail.com.
purelymail3._domainkey.cercol.team.   CNAME key3.dkimroot.purelymail.com.
```

The SPF record covers both systems; removing either `include` breaks
one of the two paths. DKIM for Purelymail is delegated through CNAMEs,
so it rotates keys without any DNS change on our side. DMARC is also
delegated to Purelymail (`p=none` with their aggregate reporting).

## Checking it works

```
dig +short TXT cercol.team                      # SPF, must include purelymail and resend
dig +short TXT resend._domainkey.cercol.team    # Resend DKIM, must not be empty
dig +short MX cercol.team                       # must be mailserver.purelymail.com
```

An application send that fails shows up in the Worker log with the
Resend error (`npx wrangler tail cercol-api --config worker/wrangler.jsonc`),
not on the mailbox side.
