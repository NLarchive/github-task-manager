# Documentation Index

This folder contains essential documentation for the GitHub Task Manager project.

## Quick Start

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | 3-minute setup guide | 3 min |
| [SETUP.md](SETUP.md) | Detailed deployment & local dev | 10 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design overview | 8 min |
| [TESTING.md](TESTING.md) | Testing & validation guide | 10 min |

## Additional Resources

- **Main Project README**: [../../README.md](../../README.md) — Full project documentation
- **Contributing Guide**: [../../CONTRIBUTING.md](../../CONTRIBUTING.md) — Development workflow
- **GitHub Pages Setup**: See [SETUP.md](SETUP.md) section "GitHub Pages Deployment"

## For Different Roles

### 👤 **User / Task Creator**
→ Start with [QUICKSTART.md](QUICKSTART.md)  
→ Learn task creation from the UI

### 🔧 **Developer**
→ Read [SETUP.md](SETUP.md) for local development  
→ Read [CONTRIBUTING.md](../../CONTRIBUTING.md) for workflow  
→ Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design

### 🚀 **DevOps / Deployer**
→ Start with [SETUP.md](SETUP.md) "GitHub Pages Deployment" section  
→ Reference [ARCHITECTURE.md](ARCHITECTURE.md) for deployment flow

### 🧪 **QA / Tester**
→ Read [TESTING.md](TESTING.md) for test commands  
→ See [ARCHITECTURE.md](ARCHITECTURE.md) for features

## Key Concepts

### Single Source of Truth
- Tasks stored in `public/tasksDB/<projectId>/tasks.json`
- This is the canonical source tracked in git
- Other formats (CSV, state files) are regenerated

### Derived Files (Auto-Generated)
- `public/tasksDB/<projectId>/state/*.json` — Filtered views
- `public/tasksDB/<projectId>/tasks.csv` — Spreadsheet export
- These are **ignored by git** to prevent merge conflicts
- CI regenerates them automatically on each deploy

### Multi-Project Support
Each project has its own directory:
```
public/tasksDB/
├── github-task-manager/
│   └── tasks.json
└── ai-career-roadmap/
    └── tasks.json
```

## File Structure

```
tools/docs/
├── 00-README.md                   # This file
├── QUICKSTART.md                  # 3-minute setup
├── SETUP.md                       # Detailed setup & deployment
├── ARCHITECTURE.md                # System design
├── TESTING.md                     # Testing guide
└── .archive/                      # Historical docs
    ├── DEPLOYMENT_SUMMARY.md
    ├── GITHUB_PAGES_SETUP.md
    ├── PLAYWRIGHT_TEST_REPORT.md
    ├── README-public.md
    └── TEMPLATE_VALIDATION_GUIDE.md
```

## Common Tasks

```bash
# Local development
npm run tasks:regenerate-all       # Regenerate state/CSV after editing tasks.json
npm run test:playwright            # Run end-to-end tests
npm run test:playwright:ui         # Run tests with UI

# Deployment
git add public/tasksDB/<projectId>/tasks.json
git commit -m "Update tasks"
git push origin main
# CI handles the rest!
```

## Getting Help

1. **Setup issues?** → See [SETUP.md](SETUP.md) Troubleshooting section
2. **Development questions?** → See [CONTRIBUTING.md](../../CONTRIBUTING.md)
3. **Test failures?** → See [TESTING.md](TESTING.md)
4. **System architecture?** → See [ARCHITECTURE.md](ARCHITECTURE.md)

## Validation Rules

Task validation is implemented in code with comments. See:
- `public/scripts/template-validator.js` — Validation logic
- `public/config/template-config.js` — Validation rules (ENUMs, patterns)

**Quick Rules:**
- Task status: `Not Started`, `In Progress`, `On Hold`, `Blocked`, `Completed`, `Cancelled`, `Pending Review`
- Priority: `Low`, `Medium`, `High`, `Critical`
- Dependencies: `FS` (Finish-to-Start), `SS` (Start-to-Start), `FF` (Finish-to-Finish), `SF` (Start-to-Finish)
- Dates: ISO 8601 format `YYYY-MM-DD`

---

**Last Updated**: December 2025  
**Status**: Active
