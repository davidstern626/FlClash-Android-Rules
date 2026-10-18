# FlClash Android Rules

Independent Android routing script for FlClash/Mihomo. This repository contains no node credentials or subscription URLs.

## Import

Use a node-only ClashMeta YAML subscription as the profile. In its menu choose More → Override → Script. Import the following script by URL, then select it for this profile:

```
https://raw.githubusercontent.com/davidstern626/FlClash-Android-Rules/main/FlClash-Android-Master.js
```

Use only this script for routing; it replaces subscription rules, policy groups, rule providers and DNS rather than appending another ruleset. Existing proxy objects are preserved. Provider-only input is not supported. Duplicate or conflicting node names must be fixed at the subscription source.

## Behavior

ChatGPT, Claude, Gemini, Copilot and other AI are routed separately. Region groups are generated from actual node names; unknown locations remain selectable. Mainland China domains/IPs use DIRECT, Google FCM uses Google services. IPv6 is disabled, Fake-IP enabled, UDP/443 rejected to encourage TCP fallback. Only automatic/fallback groups test nodes, with lazy 1800-second probes.

FlClash can override script network settings. Check the final configuration preview and Android VPN IPv6/DNS controls. App exclusions must be configured locally in FlClash. Excluded apps bypass both routing and DNS/ad filtering. Avoid excluding Google Play services or foreign apps requiring FCM.

## Updates

- Subscription refresh downloads the current remote node snapshot and reapplies this script.
- Upload/sync from the source computer updates that remote snapshot. A phone refresh does not trigger a computer upload.
- Mihomo updates rule providers at their 86400-second interval while running and online.
- Update the script with FlClash's remote-script sync action. Automatic script refresh depends on the installed version; do not assume subscription refresh also updates JS.
- Geo databases have a separate resource-update schedule. App settings may override the script's 168-hour interval.

Store node subscriptions only on a destination you control with suitable access protection. Secret Gists are unlisted, not private. Never commit airport tokens, passwords, UUIDs or node YAML to this repository or a public/unlisted Gist.

## Upstream rules

- https://github.com/blackmatrix7/ios_rule_script
- https://github.com/MetaCubeX/meta-rules-dat
- https://github.com/Loyalsoldier/clash-rules
- https://github.com/SukkaW/Surge

Policy layout is inspired by https://github.com/powerfullz/override-rules. This script does not fetch or execute the upstream script.

## Validation limits

A valid configuration and correct rule matches do not establish regional service availability, authenticated AI conversations, Android push delivery or battery savings. Test these on the target phone and network.
