# Email

Two independent systems, and confusing them is the usual source of
trouble.

**Resend** sends everything the application sends: magic links, email
change confirmations, the weekly digest, the group nudge. From
`noreply@cercol.team`, configured in `api/emails.py` as `FROM_ADDRESS`
and authenticated with `RESEND_API_KEY` in `/home/cercol/.env`.

**Stalwart** receives mail and holds the mailboxes. It runs on the same
Hetzner host as the API, shared with the topquaranta project, under the
hostname `mail.topquaranta.cat`. It is not in the application's path at
all: if Stalwart is down, the product still sends email.

| | Stalwart | Resend |
|---|---|---|
| Role | receiving, mailboxes | transactional sending |
| Hosting | self-hosted, 188.245.60.20 | SaaS |
| Protocols | IMAP, SMTP, POP3, JMAP | REST |
| Addresses | `hello@cercol.team` | `noreply@cercol.team` |
| Config | `/etc/stalwart/config.json`, data in `/var/lib/stalwart/` (RocksDB) | `RESEND_API_KEY` |
| Service | `systemctl {status,restart} stalwart` | none |

Mailbox access: <https://mail.topquaranta.cat/admin/>, IMAP
`mail.topquaranta.cat:993` and SMTP `:465`, both SSL/TLS.

## DNS, as actually published

DNS for `cercol.team` is at Porkbun. Verified against the live zone on
2026-08-04:

```
cercol.team.          MX   10 mail.topquaranta.cat.
cercol.team.          TXT  "v=spf1 mx include:_spf.resend.com -all"
_dmarc.cercol.team.   TXT  "v=DMARC1; p=none;"
resend._domainkey.cercol.team.               TXT  (Resend's RSA key)
v1-ed25519-20260427._domainkey.cercol.team.  TXT  (Stalwart, ed25519)
v1-rsa-20260427._domainkey.cercol.team.      TXT  (Stalwart, RSA)
```

The SPF record covers both systems: `mx` authorises Stalwart, the
`include` authorises Resend. Both are needed and removing either breaks
one of the two paths.

Three things differ from the note this file replaces, which lived only
on the server and was never committed:

- Resend was documented on `mail.cercol.team`, with a DKIM record and a
  return-path MX under that subdomain. Neither resolves. Resend now
  signs for the apex, `resend._domainkey.cercol.team`, which is what
  `noreply@cercol.team` needs and what is live.
- SPF was documented as `v=spf1 mx -all`, which would not authorise
  Resend at all. The published record includes it.
- DMARC was documented as `p=reject` with an aggregate report address.
  The published record is `p=none` with no `rua`. `p=none` is the safe
  setting, but nothing is collecting reports, so nobody would find out
  if a path started failing authentication. Worth revisiting; do not
  raise the policy without turning reporting on first and reading it.

## DKIM rotation

The old note said Stalwart rotates its DKIM keys every 90 days and that
Porkbun must be updated when it does. The selectors in DNS are dated
2026-04-27, so if that is true the window has passed. It was not
possible to confirm from outside whether Stalwart's stored keys still
match, because they live in RocksDB rather than in a readable config.

This only affects mail Stalwart itself sends, which is replies from
`hello@cercol.team`. Everything the product sends goes through Resend
and is unaffected.

To check and rotate:

1. Stalwart Admin, `Domains -> cercol.team -> DNS Zone File`, and
   compare the selectors it shows against what `dig` returns for
   `_domainkey.cercol.team`.
2. If they differ, add the new TXT records at Porkbun. The API field is
   `name`, not `host`, and API Access has to be enabled for the domain
   in Porkbun account settings.
3. Leave the old selector published for a few days so mail already in
   flight still verifies.

## Checking it works

```
dig +short TXT cercol.team                      # SPF, must include resend
dig +short TXT resend._domainkey.cercol.team    # Resend DKIM, must not be empty
dig +short MX cercol.team                       # must be mail.topquaranta.cat
systemctl is-active stalwart                    # receiving side only
```

An application send that fails shows up in the API log with the Resend
error, not in Stalwart. `journalctl -u cercol-api | grep -i resend`.
