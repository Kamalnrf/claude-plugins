---
name: skill-quality-gate
description: Pre-installation quality assessment and security audit system for Claude Code Skills. Evaluates skills across 6 dimensions (code quality, documentation, security, functionality, maintainability, community) before installation to help users make informed decisions about third-party skills.
---

# Skill Quality Gate

Pre-installation quality assessment and security audit system for Claude Code Skills.

## Overview

This skill provides a comprehensive quality evaluation framework for Skills before installation. It assesses code quality, documentation, security, functionality, maintainability, and community recognition to help users make informed decisions.

## Trigger Conditions

This skill is activated when:

1. **skill-manager installation** - User says "install skill #N" or "install the Nth one"
2. **skills-discovery installation** - User says "npx skills-installer install @owner/repo/skill"
3. **Manual installation** - User provides a GitHub URL and asks to install
4. **Quality assessment request** - User says "assess this skill's quality" or "rate this skill"

## Features

### 6-Dimension Quality Assessment

| Dimension | Weight | What It Checks |
|-----------|--------|----------------|
| Code Quality | 25% | Structure, complexity, comments, best practices |
| Documentation | 20% | SKILL.md completeness, examples, trigger conditions |
| Security | 30% | Dangerous patterns, data exfiltration, privilege escalation |
| Functionality | 15% | Dependencies, error handling, output formatting |
| Maintainability | 5% | Version tracking, update frequency, repository health |
| Community | 5% | Author reputation, installation count, official status |

### Scoring System

- **90-100**: Excellent (Highly Recommended)
- **75-89**: Good (Recommended)
- **60-74**: Acceptable (Usable with improvements)
- **40-59**: Poor (Needs optimization)
- **0-39**: Not Recommended

### Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Score >= 60 | Safe to install |
| 1 | Score 40-59 | User decision required |
| 2 | Score < 40 or critical issues | Do not install |

## Usage

### Command Line

```bash
# Basic assessment
bash ~/.claude/skills/skill-quality-gate/scripts/assess-skill-quality.sh /path/to/skill-dir

# With custom report output
bash ~/.claude/skills/skill-quality-gate/scripts/assess-skill-quality.sh /path/to/skill-dir report.md
```

### Integrated Installation Flow

When you ask Claude to install a skill:

1. Skill is downloaded to temporary directory
2. Security audit runs (audit-skill-security.sh)
3. Quality assessment runs (assess-skill-quality.sh)
4. Combined report is displayed
5. User confirms whether to proceed

### Example Output

```
========================================
   SKILL QUALITY ASSESSMENT SYSTEM
========================================

Target: /tmp/skill-audit-1737xxx/awesome-skill

[INFO] Assessing code quality...
[OK] SKILL.md is well-structured (45 lines)
[OK] Scripts are well-structured (3 found)
[OK] Reasonable code size (234 lines)
[OK] Good comment coverage (15%)
Code Quality Score: 25/25

...

======================================
SKILL QUALITY ASSESSMENT SUMMARY
======================================
Skill: awesome-skill
Score: 82/100
Grade: Good (Recommended)

Report saved to: skill-quality-report.md
======================================
```

## Configuration

### Customizing Scoring Rules

Edit `data/scoring-rules.json` to adjust:
- Point values for each check
- Thresholds for grade boundaries
- Weight distribution across dimensions

### Trusted Skills Whitelist

Add trusted skills to `~/.claude/config/trusted-skills.txt` to skip full assessment:

```
anthropic/official-skill
myorg/internal-skill
```

## Integration with CLAUDE.md

Add to your CLAUDE.md to enforce assessment before every installation:

```markdown
# Skill Installation Security & Quality Rules

**IMPORTANT - Mandatory Pre-Installation Assessment**:

**Trigger**: Any `npx skills-installer install` or skill installation request

**Required Flow**:
1. **No direct installation** - Never skip assessment
2. **Temporary download** - Download to `/tmp/skill-audit-$(date +%s)/`
3. **Run both assessments**:
   - `audit-skill-security.sh` (security)
   - `assess-skill-quality.sh` (quality)
4. **Display combined report** - Show security + quality results
5. **Get confirmation** - User must explicitly agree to install

**Decision Logic**:
- Security exit 2 + Quality < 40 → DO NOT INSTALL
- Security exit 1 + Quality < 60 → Warning, needs user confirmation
- Security exit 0 + Quality >= 75 → Recommended
- Other cases → Show report, let user decide
```

## Compatibility

This skill works with:

- **skill-manager** - Local database of 31,767+ skills
- **skills-discovery** - claude-plugins.dev online registry
- **Manual installation** - Direct GitHub URL installation

## Dependencies

- Bash 4.0+
- Node.js (optional, for database queries)
- `audit-skill-security.sh` (recommended, for security assessment)

## Related Skills

- **skill-security-auditor** - Detailed security-focused audit
- **skill-manager** - Browse and install skills from database
- **skills-discovery** - Search online skill registry

## Author

Created by the Claude Code community.

## License

MIT

---

*Always review source code before installing third-party skills, regardless of quality score.*
