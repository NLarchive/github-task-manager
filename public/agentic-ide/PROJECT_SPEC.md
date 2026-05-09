# Project Specification: agentic-ide
Generated: 2026-04-28 21:20
<!-- To update this file, run: python D:\tool\extract_project_spec\app.py --root D:\web\web-github-task-manager\public\agentic-ide\ --miss-docs -->

## Folder structure

.docs
chat
chat\css
chat\js
chat\tests
components
components\agents
components\agents\chat-quality-inspector
components\agents\data_processor_v1
components\agents\data_processor_v1\tests
components\agents\search_agent_v1
components\agents\search_agent_v1\tests
components\inference
components\inference\engines
components\inference\engines\duck4i-llama
components\inference\engines\hyllama
components\inference\engines\llama-server-openai
components\inference\engines\llama3pure
components\inference\engines\llmjs
components\inference\engines\node-llama-cpp
components\inference\engines\webllm
components\inference\tests
components\inference\tests\coding
components\inference\tests\results
components\inference\tests\text
components\runtime
components\runtime\llama-b8920-win-cuda12.4
components\subgraphs
components\subgraphs\format_info_v1
components\subgraphs\format_info_v1\tests
components\tools
components\tools\benchmark_result_writer_v1
components\tools\benchmark_result_writer_v1\tests
components\tools\folder-graph-scanner
components\tools\folder-graph-scanner\ui
components\tools\html_parser_v1
components\tools\html_parser_v1\tests
components\tools\research_benchmark_runner_v1
components\tools\result_ranker_v1
components\tools\result_ranker_v1\tests
components\tools\ui_renderer_v1
components\tools\ui_renderer_v1\tests
components\tools\web_search_v1
components\tools\web_search_v1\tests
js
schema
tests
ui
workflows
workflows\benchmarks
workflows\benchmarks\outputs
workflows\benchmarks\research_benchmark_v1
workflows\benchmarks\research_benchmark_v1\tests
workflows\research_workflow_v1
workflows\research_workflow_v1\tests
.docs\ARCHITECTURE_OVERVIEW.md
.docs\CHAT_GRAPH_DEBUG_GUIDE.md
.docs\COMPLETE_SUITE_README.md
.docs\IMPLEMENTATION_SUMMARY.md
.docs\INFERENCE_CODE_WALKTHROUGH.md
.docs\INFERENCE_QUICK_REFERENCE.md
.docs\INFERENCE_TESTING_GUIDE.md
.docs\QUICK_START.md
.docs\START_HERE.md
.docs\TROUBLESHOOTING.md
.docs\VERIFICATION_REPORT.md
.gitignore
chat\chat-screen.schema.json
chat\css\chat-lab.css
chat\index.html
chat\js\chat-api.js
chat\js\chat-app.js
chat\js\chat-catalog.json
chat\js\chat-render.js
chat\js\chat-response-validator.js
chat\js\chat-state.js
chat\js\chat-telemetry.js
chat\js\chat-tests.js
chat\node.tasks.json
chat\schema.json
chat\tests\chat-lab.test.js
chat\tests\chat-surface.test-plan.json
code.graph.json
components\agents\chat-quality-inspector\main.js
components\agents\chat-quality-inspector\schema.json
components\agents\chat-quality-inspector\test.js
components\agents\data_processor_v1\prompt.md
components\agents\data_processor_v1\schema.json
components\agents\data_processor_v1\tests\behavior.json
components\agents\search_agent_v1\prompt.md
components\agents\search_agent_v1\schema.json
components\agents\search_agent_v1\tests\behavior.json
components\inference\engines\duck4i-llama\adapter.js
components\inference\engines\hyllama\adapter.js
components\inference\engines\llama-server-openai\adapter.js
components\inference\engines\llama3pure\adapter.js
components\inference\engines\llmjs\adapter.js
components\inference\engines\node-llama-cpp\adapter.js
components\inference\engines\webllm\adapter.js
components\inference\main.js
components\inference\README.md
components\inference\schema.json
components\inference\tests\benchmark.js
components\inference\tests\coding\coding_cases.json
components\inference\tests\coding\run-coding-suite.js
components\inference\tests\index.html
components\inference\tests\results\active-engines.json
components\inference\tests\results\combined-case-leaderboard-latest.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-12-35-774Z-details.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-12-35-774Z-report.json
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-12-35-774Z-summary.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-14-45-582Z-details.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-14-45-582Z-report.json
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-14-45-582Z-summary.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-15-59-946Z-details.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-15-59-946Z-report.json
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-15-59-946Z-summary.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-case-leaderboard.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-details.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-report.json
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-summary.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-case-leaderboard.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-details.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-report.json
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-summary.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-case-leaderboard.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-details.csv
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-report.json
components\inference\tests\results\llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-summary.csv
components\inference\tests\results\llm_js_coding_execution_v1-latest-case-leaderboard.csv
components\inference\tests\results\llm_js_coding_execution_v1-latest-details.csv
components\inference\tests\results\llm_js_coding_execution_v1-latest-report.json
components\inference\tests\results\llm_js_coding_execution_v1-latest-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-40-34-056Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-40-34-056Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-40-34-056Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-42-08-441Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-42-08-441Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-42-08-441Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-43-28-717Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-43-28-717Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-43-28-717Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-57-00-141Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-57-00-141Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-57-00-141Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-58-36-735Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-58-36-735Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T22-58-36-735Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-case-leaderboard.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-case-leaderboard.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-case-leaderboard.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-summary.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-latest-case-leaderboard.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-latest-details.csv
components\inference\tests\results\llm_unit_parseable_validation_v1-latest-report.json
components\inference\tests\results\llm_unit_parseable_validation_v1-latest-summary.csv
components\inference\tests\select-best.js
components\inference\tests\text\hello-world-conformance.js
components\inference\tests\text\run-validation-suite.js
components\inference\tests\text\validation_cases.json
components\runtime\llama-b8920-win-cuda12.4\cublas64_12.dll
components\runtime\llama-b8920-win-cuda12.4\cublasLt64_12.dll
components\runtime\llama-b8920-win-cuda12.4\cudart64_12.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-base.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-alderlake.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-cannonlake.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-cascadelake.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-cooperlake.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-haswell.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-icelake.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-ivybridge.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-piledriver.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-sandybridge.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-sapphirerapids.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-skylakex.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-sse42.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-x64.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cpu-zen4.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-cuda.dll
components\runtime\llama-b8920-win-cuda12.4\ggml-rpc.dll
components\runtime\llama-b8920-win-cuda12.4\ggml.dll
components\runtime\llama-b8920-win-cuda12.4\libomp140.x86_64.dll
components\runtime\llama-b8920-win-cuda12.4\llama-batched-bench.exe
components\runtime\llama-b8920-win-cuda12.4\llama-bench.exe
components\runtime\llama-b8920-win-cuda12.4\llama-cli.exe
components\runtime\llama-b8920-win-cuda12.4\llama-common.dll
components\runtime\llama-b8920-win-cuda12.4\llama-completion.exe
components\runtime\llama-b8920-win-cuda12.4\llama-fit-params.exe
components\runtime\llama-b8920-win-cuda12.4\llama-gemma3-cli.exe
components\runtime\llama-b8920-win-cuda12.4\llama-gguf-split.exe
components\runtime\llama-b8920-win-cuda12.4\llama-imatrix.exe
components\runtime\llama-b8920-win-cuda12.4\llama-llava-cli.exe
components\runtime\llama-b8920-win-cuda12.4\llama-minicpmv-cli.exe
components\runtime\llama-b8920-win-cuda12.4\llama-mtmd-cli.exe
components\runtime\llama-b8920-win-cuda12.4\llama-mtmd-debug.exe
components\runtime\llama-b8920-win-cuda12.4\llama-perplexity.exe
components\runtime\llama-b8920-win-cuda12.4\llama-quantize.exe
components\runtime\llama-b8920-win-cuda12.4\llama-qwen2vl-cli.exe
components\runtime\llama-b8920-win-cuda12.4\llama-results.exe
components\runtime\llama-b8920-win-cuda12.4\llama-server.exe
components\runtime\llama-b8920-win-cuda12.4\llama-template-analysis.exe
components\runtime\llama-b8920-win-cuda12.4\llama-tokenize.exe
components\runtime\llama-b8920-win-cuda12.4\llama-tts.exe
components\runtime\llama-b8920-win-cuda12.4\llama.dll
components\runtime\llama-b8920-win-cuda12.4\mtmd.dll
components\runtime\llama-b8920-win-cuda12.4\rpc-server.exe
components\runtime\schema.json
components\subgraphs\format_info_v1\graph.json
components\subgraphs\format_info_v1\schema.json
components\subgraphs\format_info_v1\state.js
components\subgraphs\format_info_v1\tests\snapshot.json
components\tools\benchmark_result_writer_v1\main.js
components\tools\benchmark_result_writer_v1\schema.json
components\tools\benchmark_result_writer_v1\tests\unit.json
components\tools\folder-graph-scanner\main.js
components\tools\folder-graph-scanner\schema.json
components\tools\folder-graph-scanner\ui\main.js
components\tools\html_parser_v1\main.js
components\tools\html_parser_v1\schema.json
components\tools\html_parser_v1\tests\unit.json
components\tools\README.md
components\tools\research_benchmark_runner_v1\main.js
components\tools\research_benchmark_runner_v1\schema.json
components\tools\result_ranker_v1\main.js
components\tools\result_ranker_v1\schema.json
components\tools\result_ranker_v1\tests\unit.json
components\tools\schema.json
components\tools\ui_renderer_v1\main.js
components\tools\ui_renderer_v1\schema.json
components\tools\ui_renderer_v1\template.html
components\tools\ui_renderer_v1\tests\snapshot.json
components\tools\web_search_v1\main.js
components\tools\web_search_v1\schema.json
components\tools\web_search_v1\tests\unit.json
index.html
js\bridge-server.js
js\bridge-workspace.js
js\bridge.js
js\export.js
js\main.js
js\modals.js
js\README.md
js\render.js
js\schema-preview.js
js\state.js
js\types.js
js\utils.js
node.tasks.json
README.md
registry.json
schema\component.schema.json
schema\unit-case.schema.json
tests\inference-debug.js
tests\inference-quality-test.js
tests\test-inference.ps1
ui\README.md
ui\style.css
workflows\benchmarks\outputs\bridge-runtime-check-manual-check-mojd4oy5.json
workflows\benchmarks\outputs\README.md
workflows\benchmarks\outputs\research-benchmark-direct-fresh-1777343730183-moi0lnna.json
workflows\benchmarks\outputs\research-benchmark-live-gemma4-bridge-1777343817-moi0mrwo.json
workflows\benchmarks\outputs\research-benchmark-live-gemma4-bridge-second-1777343873-moi0p952.json
workflows\benchmarks\outputs\research-benchmark-post-migration-benchmark-2-moivtgmv.json
workflows\benchmarks\outputs\research-benchmark-post-migration-benchmark-final-moivtrdz.json
workflows\benchmarks\outputs\research-benchmark-post-migration-benchmark-moivt0s6.json
workflows\benchmarks\outputs\research-benchmark-speed-audit-1777390596-moish279.json
workflows\benchmarks\outputs\research-benchmark-writer-check-1777343570-moi0h0e3.json
workflows\benchmarks\README.md
workflows\benchmarks\research_benchmark.json
workflows\benchmarks\research_benchmark_v1\schema.json
workflows\benchmarks\research_benchmark_v1\state.js
workflows\benchmarks\research_benchmark_v1\tests\live.json
workflows\benchmarks\research_benchmark_v1\workflow.json
workflows\research_workflow_v1\schema.json
workflows\research_workflow_v1\state.js
workflows\research_workflow_v1\state.py
workflows\research_workflow_v1\tests\e2e.json
workflows\research_workflow_v1\workflow.json

---

## File Structures

structure from .gitignore:  (no extractable definitions)

structure from README.md:
    [file-summary] Agentic IDE
    [heading-1] # Agentic IDE
    [heading-2] ## Start
    [heading-2] ## Runtime Requirements
    [heading-2] ## Cell Contract System
    [heading-2] ## Page Layout
    [heading-2] ## Trees
    [heading-3] ### Library
    [heading-3] ### Graph
    [heading-2] ## Mobile Behavior
    [heading-2] ## Header Controls
    [heading-3] ### Model selector
    [heading-3] ### Chat
    [heading-2] ## Bottom Panel Tabs
    [heading-3] ### JSON
    [heading-3] ### Code
    [heading-3] ### Edge
    [heading-3] ### Meta
    [heading-3] ### Tasks
    [heading-3] ### Tests
    [heading-3] ### Issues
    [heading-2] ## Inspector
    [heading-2] ## How To Work With Components
    [heading-2] ## Benchmark Workflow
    [heading-2] ## Running The Benchmark
    [heading-2] ## Project Structure Semantics
    [heading-2] ## Validation Strategy
    [heading-2] ## Notes

structure from code.graph.json:  (no extractable definitions)

structure from index.html:
    [file-summary] Visual IDE for designing agentic workflow graphs — compose typed component nodes, wire data-flow edges, and export to graph-display templates.
    [title] <title>Agentic Graph Designer</title>
    [meta] meta[description]  «Visual IDE for designing agentic workflow graphs — compose typed component nodes, wire data-flow edges, and export to gr»
    [section] <header id="page-header">
    [heading-1] <h1>Graph Designer</h1>
    [section] <aside id="sidebar">
    [section] <aside id="right-panel">
    [heading-3] <h3>Add Component</h3>
    [heading-3] <h3>Add Edge</h3>
    [heading-3] <h3>Import JSON</h3>
    [heading-3] <h3>Chat with Local LLM</h3>
    [heading-2] <h2>Agentic workflow IDE with graph canvas, file tree, code viewer, and node inspector</h2>

structure from node.tasks.json:
    [json-key] project: {name, description, start_date, end_date, status, +2 more}
    [json-key] categories: [6 items]
    [json-key] workers: [2 items]
    [json-key] tasks: [38 items]

structure from registry.json:
    [json-key] version: 1
    [json-key] generated_at: "2026-04-28T21:46:46.408Z"
    [json-key] component_schema: "schema/component.schema.json"
    [json-key] unit_case_schema: "schema/unit-case.schema.json"
    [json-key] components: {tools, agents, models, subgraphs, workflows}
    [json-key] edges: [5 items]

structure from .docs/ARCHITECTURE_OVERVIEW.md:
    [file-summary] Inference Testing Architecture
    [heading-1] # Inference Testing Architecture
    [heading-2] ## System Architecture: Complete Pipeline
    [heading-2] ## Testing Framework: How Tools Interact
    [heading-2] ## Quality Analysis Flow
    [heading-2] ## Documentation Navigation Map
    [heading-2] ## File Organization
    [heading-2] ## Quick Decision Tree: Which File Should I Read?
    [heading-2] ## Summary of What You Have
    [heading-2] ## 🎯 Next Action

structure from .docs/CHAT_GRAPH_DEBUG_GUIDE.md:
    [file-summary] Agentic IDE - Chat Debug & Graph Designer Guide
    [heading-1] # Agentic IDE - Chat Debug & Graph Designer Guide
    [heading-2] ## Overview
    [heading-2] ## 1. Chat Nonsense Debug Guide
    [heading-3] ### Problem
    [heading-3] ### Root Causes to Check
    [heading-3] ### Debug Steps
    [heading-4] #### Step 1: Check Bridge Status
    [heading-4] #### Step 2: Check Console Logs
    [heading-4] #### Step 3: Verify Payload Format
    [heading-4] #### Step 4: Check Response Format
    [heading-4] #### Step 5: Test Configuration
    [heading-3] ### Common Issues and Solutions
    [heading-2] ## 2. Graph Creation - Blank Canvas Fix
    [heading-3] ### What Changed
    [heading-3] ### How It Works
    [heading-4] #### Before
    [heading-4] #### After
    [heading-3] ### Usage
    [heading-3] ### Graph State Lifecycle
    [heading-2] ## 3. Folder Structure Scanner
    [heading-3] ### What It Does
    [heading-3] ### Example Structure
    [heading-3] ### Using the Scanner
    [heading-4] #### Option 1: Browser UI (when implemented)
    [heading-4] #### Option 2: CLI (server-side)
    [heading-1] # Scan a folder and get code.graph.json
    [heading-4] #### Option 3: API
    [heading-3] ### Scanner Output Format
    [heading-3] ### Node Types
    [heading-3] ### Edge Types
    [heading-2] ## 4. Workflow: Create Graph from Folder
    [heading-3] ### Complete Example
    [heading-4] #### 1. Start with Blank Canvas
    [heading-4] #### 2. Auto-Discover Structure
    [heading-4] #### 3. Review and Refine
    [heading-4] #### 4. Add Custom Metadata
    [heading-4] #### 5. Export and Save
    [heading-2] ## 5. Troubleshooting
    [heading-3] ### Graph Issues
    [heading-3] ### Chat Issues
    [heading-3] ### Scanner Issues
    [heading-2] ## 6. Architecture Overview
    [heading-2] ## 7. Next Steps
    [heading-3] ### Immediate
    [heading-3] ### Short-term
    [heading-3] ### Long-term
    [heading-2] ## 8. Configuration Files
    [heading-3] ### Chat Configuration
    [heading-3] ### Graph State
    [heading-3] ### Scanner Config

structure from .docs/COMPLETE_SUITE_README.md:
    [file-summary] Inference Testing & Debugging Tools - Complete Suite
    [heading-1] # Inference Testing & Debugging Tools - Complete Suite
    [heading-2] ## 📦 What Was Created
    [heading-3] ### 4 Executable Tools
    [heading-3] ### 4 Documentation Files
    [heading-2] ## 🔄 How They Work Together
    [heading-3] ### Workflow 1: Quick Verification (5 minutes)
    [heading-3] ### Workflow 2: Detailed Debugging (15 minutes)
    [heading-3] ### Workflow 3: Code Understanding (20 minutes)
    [heading-2] ## 📊 Test Suite Features
    [heading-3] ### Quality Analysis
    [heading-3] ### Scoring System (0-100)
    [heading-2] ## 🎯 Test Cases Included
    [heading-2] ## 📁 File Locations
    [heading-2] ## 🚀 Quick Start (30 seconds)
    [heading-3] ### Option A: Automatic (PowerShell)
    [heading-3] ### Option B: Manual (3 terminals)
    [heading-2] ## 📈 Sample Output
    [heading-3] ### Test Results Summary
    [heading-2] ## 🔍 Debug Output Example
    [heading-2] ## 🎓 Learning Path
    [heading-3] ### Level 1: Just Run It
    [heading-3] ### Level 2: Understand Output
    [heading-3] ### Level 3: Understand Code
    [heading-3] ### Level 4: Extend & Customize
    [heading-2] ## 🔗 Integration Points
    [heading-3] ### With Chat Lab
    [heading-3] ### With Bridge Server
    [heading-3] ### With LLaMA.cpp
    [heading-2] ## ✅ Verification Checklist
    [heading-2] ## 🐛 Troubleshooting Quick Links
    [heading-2] ## 📞 Support Resources
    [heading-2] ## 🎯 Next Steps
    [heading-3] ### Immediate (Today)
    [heading-3] ### Short-term (This week)
    [heading-3] ### Medium-term (This month)
    [heading-2] ## 📊 Metrics Tracked
    [heading-2] ## 📝 Version History
    [heading-2] ## 🏆 Success Criteria

structure from .docs/IMPLEMENTATION_SUMMARY.md:
    [file-summary] Implementation Summary: Chat Debug & Graph Designer Enhancements
    [heading-1] # Implementation Summary: Chat Debug & Graph Designer Enhancements
    [heading-2] ## Executive Summary
    [heading-2] ## What Was Changed
    [heading-3] ### 1. Graph State Management (`public/agentic-ide/js/state.js`)
    [heading-3] ### 2. Graph Creation UI (`public/agentic-ide/js/main.js`)
    [heading-3] ### 3. Chat Debug Logging (`public/agentic-ide/chat/js/chat-app.js`)
    [heading-3] ### 4. Folder Scanner Tool (`public/agentic-ide/components/tools/folder-graph-scanner.js`)
    [heading-3] ### 5. Scanner UI Integration (`public/agentic-ide/components/tools/folder-graph-scanner-ui.js`)
    [heading-3] ### 6. Server API Endpoint (`server.js`)
    [heading-2] ## Files Modified
    [heading-2] ## Files Created
    [heading-2] ## Testing & Validation
    [heading-3] ### Test Results
    [heading-4] #### Graph Creation
    [heading-4] #### Chat Debugging
    [heading-4] #### Scanner
    [heading-2] ## Architecture
    [heading-3] ### Data Flow: Graph Creation
    [heading-3] ### Data Flow: Chat Debug
    [heading-3] ### Data Flow: Scanner
    [heading-2] ## Usage Guide
    [heading-3] ### Graph Creation
    [heading-3] ### Chat Debugging
    [heading-3] ### Scanner Usage
    [heading-2] ## Performance Impact
    [heading-2] ## Known Limitations
    [heading-2] ## Next Steps (Optional Enhancements)
    [heading-3] ### Short-term (1-2 weeks)
    [heading-3] ### Mid-term (3-4 weeks)
    [heading-3] ### Long-term (1-2 months)
    [heading-2] ## Rollback Plan
    [heading-2] ## Documentation
    [heading-3] ### For Users
    [heading-3] ### For Developers
    [heading-2] ## Sign-Off

structure from .docs/INFERENCE_CODE_WALKTHROUGH.md:
    [file-summary] Inference Code Walkthrough
    [heading-1] # Inference Code Walkthrough
    [heading-2] ## File Map: Where Inference Happens
    [heading-2] ## Inference Flow: Step-by-Step
    [heading-3] ### 1️⃣ User Types Prompt in Chat Lab
    [heading-3] ### 2️⃣ Call Bridge Client Function
    [heading-3] ### 3️⃣ Bridge Server Receives Request
    [heading-3] ### 4️⃣ Forward Request to LLaMA.cpp
    [heading-3] ### 5️⃣ LLaMA.cpp Processes and Responds
    [heading-3] ### 6️⃣ Bridge Server Parses and Returns Response
    [heading-3] ### 7️⃣ Browser Receives and Processes Response
    [heading-3] ### 8️⃣ Quality Validation (NEW)
    [heading-3] ### 9️⃣ Display Response to User
    [heading-2] ## Tracing Issues: Debug Path
    [heading-3] ### 🔴 If Response is Corrupted (로직로직로직...)
    [heading-3] ### 📊 Detailed Debug Locations
    [heading-2] ## Key Constants & Defaults
    [heading-2] ## Environment Variables
    [heading-1] # Override bridge port
    [heading-1] # Override LLM endpoint
    [heading-1] # Then start bridge server
    [heading-2] ## Response Format Compatibility
    [heading-2] ## Performance Metrics to Monitor
    [heading-2] ## Related Test Commands
    [heading-1] # Quick test: Basic connectivity
    [heading-1] # Quality test suite
    [heading-1] # Detailed debugging
    [heading-1] # PowerShell quick start

structure from .docs/INFERENCE_QUICK_REFERENCE.md:
    [file-summary] Inference Testing - Quick Reference Card
    [heading-1] # Inference Testing - Quick Reference Card
    [heading-2] ## 📋 One-Page Cheat Sheet
    [heading-3] ### Start Tests
    [heading-1] # Option 1: PowerShell one-liner (auto-starts servers if needed)
    [heading-1] # Option 2: Run quality test only (servers must be running)
    [heading-1] # Option 3: Debug specific request
    [heading-1] # Option 4: PowerShell with auto-start
    [heading-3] ### Start Servers Manually
    [heading-1] # Terminal 1: Bridge Server
    [heading-1] # Terminal 2: LLaMA.cpp
    [heading-3] ### Check Server Status
    [heading-1] # Bridge server
    [heading-1] # LLaMA.cpp
    [heading-2] ## 📊 Test Output Interpretation
    [heading-3] ### ✅ Good Response (Quality Score 80-100)
    [heading-3] ### ⚠️ Suspicious Response (Quality Score 50-79)
    [heading-3] ### ❌ Invalid Response (Quality Score < 50)
    [heading-2] ## 🔍 Debug Flow Chart
    [heading-2] ## 🐛 Common Issues & Fixes
    [heading-2] ## 📈 Expected Performance
    [heading-2] ## 🎯 Test Cases Included
    [heading-2] ## 📚 Documentation
    [heading-2] ## 🔑 Key Files in Flow
    [heading-2] ## 🚀 Quick Validation Commands
    [heading-1] # Test 1: Basic connectivity
    [heading-1] # Test 2: Math question
    [heading-1] # Test 3: Full suite (all tests)
    [heading-1] # Test 4: Debug (verbose trace)
    [heading-1] # Test 5: Watch bridge server logs
    [heading-2] ## 💡 Pro Tips
    [heading-2] ## 📞 Support

structure from .docs/INFERENCE_TESTING_GUIDE.md:
    [file-summary] Inference Quality Testing & Debugging Guide
    [heading-1] # Inference Quality Testing & Debugging Guide
    [heading-2] ## Overview
    [heading-2] ## Architecture: Request Flow
    [heading-2] ## Test Files
    [heading-3] ### 1. `inference-quality-test.js` - Comprehensive Test Suite
    [heading-1] # Run all inference tests
    [heading-1] # Or with npx in the project root
    [heading-3] ### 2. `inference-debug.js` - Step-by-Step Pipeline Debugger
    [heading-1] # Test with default prompt "What is 2+2?"
    [heading-1] # Test with custom prompt
    [heading-1] # Test with non-English
    [heading-2] ## Setup: Prerequisites
    [heading-3] ### 1. Start the Bridge Server
    [heading-1] # Terminal 1: Start the bridge server
    [heading-1] # Expected output:
    [heading-1] # [agentic-ide bridge] http://localhost:3131
    [heading-1] # [agentic-ide bridge] ROOT  : /path/to/public/agentic-ide/
    [heading-1] # [agentic-ide bridge] LLM   : http://localhost:8080  (llama.cpp)
    [heading-3] ### 2. Start LLaMA.cpp Server
    [heading-1] # Terminal 2: Navigate to llama directory and start server
    [heading-1] # Expected output:
    [heading-1] # slot 0: n_tokens = 0
    [heading-1] # slot 1: n_tokens = 0
    [heading-1] # ...
    [heading-1] # server: listening on http://0.0.0.0:8080
    [heading-3] ### 3. Verify Both Servers Are Running
    [heading-1] # Check bridge server
    [heading-1] # Check llama.cpp
    [heading-2] ## Understanding the Output: Quality Scores
    [heading-3] ### Quality Score Breakdown
    [heading-2] ## Troubleshooting: Common Issues
    [heading-3] ### Issue 1: "LLaMA.cpp is not reachable"
    [heading-1] # Start llama-server
    [heading-1] # Test connection
    [heading-3] ### Issue 2: "Bridge Server not responding"
    [heading-1] # Start bridge server
    [heading-1] # Test connection
    [heading-3] ### Issue 3: Corrupted Response (로직로직로직...)
    [heading-1] # Kill llama-server and restart
    [heading-3] ### Issue 4: Wrong Math Answers
    [heading-2] ## Code Reference: Key Functions
    [heading-3] ### bridge.js - Client Side
    [heading-3] ### bridge-server.js - Backend Forwarding
    [heading-2] ## Performance Expectations
    [heading-2] ## Next Steps

structure from .docs/QUICK_START.md:
    [file-summary] Quick Start: New Agentic IDE Features
    [heading-1] # Quick Start: New Agentic IDE Features
    [heading-2] ## 🚀 Feature 1: Blank Canvas Graph Creation
    [heading-3] ### What's Fixed
    [heading-3] ### How to Use
    [heading-2] ## 🔍 Feature 2: Debug Chat Issues
    [heading-3] ### What's Fixed
    [heading-3] ### How to Debug
    [heading-3] ### What to Look For
    [heading-3] ### Checklist
    [heading-2] ## 🗂️ Feature 3: Auto-Discover Graph from Folder
    [heading-3] ### What It Does
    [heading-3] ### How to Use (API)
    [heading-4] #### Via Browser Console
    [heading-4] #### Via Command Line
    [heading-1] # Get the graph structure
    [heading-3] ### What You Get
    [heading-3] ### Scanner Output
    [heading-2] ## ⚙️ Configuration Tips
    [heading-3] ### For Coherent Chat Responses
    [heading-3] ### For Graph Discovery
    [heading-2] ## 🐛 Quick Troubleshooting
    [heading-3] ### Graph Issues
    [heading-3] ### Chat Issues
    [heading-3] ### Scanner Issues
    [heading-2] ## 📊 Example Workflows
    [heading-3] ### Workflow 1: Create Custom Graph
    [heading-3] ### Workflow 2: Auto-Discover and Refine
    [heading-3] ### Workflow 3: Debug Chat
    [heading-2] ## 📚 Further Reading
    [heading-2] ## ✅ Verification Checklist

structure from .docs/START_HERE.md:
    [file-summary] Summary: Inference Testing & Debugging Complete ✅
    [heading-1] # Summary: Inference Testing & Debugging Complete ✅
    [heading-2] ## What You Now Have
    [heading-3] ### 📦 4 Executable Tools
    [heading-3] ### 📚 4 Detailed Documentation Files
    [heading-2] ## 🎯 What Each Tool Does
    [heading-3] ### Tool 1: `inference-quality-test.js`
    [heading-3] ### Tool 2: `inference-debug.js`
    [heading-3] ### Tool 3: `test-inference.ps1`
    [heading-1] # With auto-start of servers:
    [heading-1] # With debug mode:
    [heading-2] ## 🚀 Quick Start (Choose One)
    [heading-3] ### Option A: Fastest (One Command)
    [heading-3] ### Option B: Manual (More Control)
    [heading-2] ## 📊 Understanding the Output
    [heading-3] ### ✅ Success (All Tests Pass)
    [heading-3] ### ⚠️ Issue Found (Some Tests Fail)
    [heading-2] ## 🔍 If Something Goes Wrong
    [heading-3] ### Problem: "Bridge offline"
    [heading-1] # Check connection
    [heading-1] # If fails, start bridge server:
    [heading-3] ### Problem: "LLaMA offline"
    [heading-1] # Check connection
    [heading-1] # If fails, start llama-server:
    [heading-3] ### Problem: "Response is corrupted (로직로직로직...)"
    [heading-1] # Debug the pipeline
    [heading-1] # Compare Step 2 (direct llama) vs Step 3 (via bridge)
    [heading-1] # If Step 2 also corrupted → problem is in llama-server
    [heading-1] #    Solution: Restart llama-server
    [heading-1] # If only Step 3 corrupted → problem is in bridge
    [heading-1] #    Solution: Check bridge-server.js requestLlmCompletion()
    [heading-2] ## 📍 Key Code Locations
    [heading-2] ## 🎓 Learning Path
    [heading-3] ### I just want to test (5 minutes)
    [heading-1] # View results
    [heading-3] ### I want to debug an issue (15 minutes)
    [heading-1] # Start servers first
    [heading-1] # Watch it trace through 4 steps
    [heading-3] ### I want to understand the code (30 minutes)
    [heading-1] # Just read - no commands needed
    [heading-2] ## 📈 What Gets Tested
    [heading-2] ## ✅ Success Checklist
    [heading-2] ## 🎯 What This Fixes
    [heading-3] ### Original Problem
    [heading-3] ### What You Now Have
    [heading-2] ## 📞 Need Help?
    [heading-2] ## 🔄 Complete Workflow
    [heading-2] ## 📋 File Summary
    [heading-2] ## 🚀 Next Actions
    [heading-3] ### Immediate (Do This Now)
    [heading-3] ### Today (Before End of Day)
    [heading-3] ### This Week
    [heading-2] ## 📌 Key Points to Remember
    [heading-2] ## ✨ You're Ready!

structure from .docs/TROUBLESHOOTING.md:
    [file-summary] Agentic IDE: Integration & Troubleshooting Guide
    [heading-1] # Agentic IDE: Integration & Troubleshooting Guide
    [heading-2] ## Pre-Flight Checklist
    [heading-2] ## Feature Integration Points
    [heading-3] ### 1. Graph Designer Integration
    [heading-3] ### 2. Chat Integration
    [heading-3] ### 3. Scanner API Integration
    [heading-2] ## Diagnostic Procedures
    [heading-3] ### Procedure 1: Test Graph Creation
    [heading-4] #### Step 1: Navigate to Graph Designer
    [heading-4] #### Step 2: Clear Local State
    [heading-4] #### Step 3: Test New Graph
    [heading-4] #### Step 4: Verify State
    [heading-3] ### Procedure 2: Test Chat Debugging
    [heading-4] #### Step 1: Open Chat
    [heading-4] #### Step 2: Enable Console Logging
    [heading-4] #### Step 3: Adjust Settings
    [heading-4] #### Step 4: Send Test Message
    [heading-4] #### Step 5: Check Console Logs
    [heading-4] #### Step 6: Interpret Results
    [heading-3] ### Procedure 3: Test Scanner API
    [heading-4] #### Step 1: Test Endpoint
    [heading-1] # In terminal/PowerShell:
    [heading-4] #### Step 2: Verify Response Structure
    [heading-4] #### Step 3: Test Via Browser
    [heading-4] #### Step 4: Check Results
    [heading-2] ## Common Issues & Solutions
    [heading-3] ### Issue: "New Graph shows old graph"
    [heading-3] ### Issue: "Chat still produces gibberish"
    [heading-3] ### Issue: "Scanner returns empty nodes"
    [heading-3] ### Issue: "Bridge offline status badge"
    [heading-1] # 1. Start bridge
    [heading-1] # 2. Test connection
    [heading-1] # 3. Check firewall
    [heading-1] # Windows: Check Windows Defender Firewall
    [heading-1] # Mac: System Preferences > Security & Privacy
    [heading-1] # Linux: sudo ufw status
    [heading-1] # 4. Verify URL
    [heading-1] # Browser console: S.state.config.endpoint
    [heading-3] ### Issue: "No debug logs appearing"
    [heading-2] ## Performance Tuning
    [heading-3] ### For Faster Chat Responses
    [heading-3] ### For Faster Scanner
    [heading-2] ## Validation Checklist
    [heading-3] ### Graph Designer
    [heading-3] ### Chat Interface
    [heading-3] ### Scanner API
    [heading-3] ### Integration
    [heading-2] ## Advanced Debugging
    [heading-3] ### Enable Verbose Logging (Development)
    [heading-3] ### Monitor State Changes
    [heading-3] ### Check Network Traffic
    [heading-2] ## Getting Help
    [heading-3] ### Check These Files
    [heading-3] ### Browser Console Hints
    [heading-3] ### Server Logs
    [heading-1] # Watch server output for errors
    [heading-1] # Look for:
    [heading-1] # [api] /api/scanner/scan
    [heading-1] # [error] ...
    [heading-1] # [debug] ...

structure from .docs/VERIFICATION_REPORT.md:
    [file-summary] ✅ Implementation Verification Report
    [heading-1] # ✅ Implementation Verification Report
    [heading-2] ## Test Results
    [heading-3] ### Unit Tests
    [heading-3] ### Syntax Verification
    [heading-3] ### File Integrity
    [heading-2] ## Feature Verification Checklist
    [heading-3] ### Feature 1: Blank Canvas Graph Creation
    [heading-3] ### Feature 2: Chat Debug Logging
    [heading-3] ### Feature 3: Folder Scanner Tool
    [heading-3] ### Feature 4: Server API Endpoint
    [heading-3] ### Feature 5: UI Integration
    [heading-3] ### Feature 6: Documentation
    [heading-2] ## Backward Compatibility Check
    [heading-2] ## Security Review
    [heading-3] ### Graph Creation
    [heading-3] ### Chat Debug
    [heading-3] ### Scanner API
    [heading-2] ## Performance Impact
    [heading-3] ### Graph Creation
    [heading-3] ### Chat Debug
    [heading-3] ### Scanner API
    [heading-2] ## Dependencies
    [heading-3] ### New Dependencies
    [heading-3] ### Imports Used
    [heading-2] ## Known Limitations
    [heading-2] ## Deployment Checklist
    [heading-2] ## Testing Instructions for QA
    [heading-3] ### Test 1: Blank Canvas Creation
    [heading-3] ### Test 2: Chat Debug Logging
    [heading-3] ### Test 3: Scanner API
    [heading-3] ### Test 4: Existing Functionality
    [heading-2] ## Sign-Off

structure from chat/chat-screen.schema.json:
    [file-summary] Agentic IDE Chat Screen State
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "https://local.agentic-ide/chat-screen.schema.json"
    [json-key] title: "Agentic IDE Chat Screen State"
    [json-key] type: "object"
    [json-key] required: [5 items]
    [json-key] properties: {generatedAt, modelId, historyCount, config, logs, +1 more}
    [json-key] additionalProperties: false

structure from chat/index.html:
    [file-summary] Standalone chat lab with configurable prompts, agents, tools, tests, memory evaluation, and structured telemetry outputs.
    [title] <title>Agentic IDE Chat Lab</title>
    [meta] meta[description]  «Standalone chat lab with configurable prompts, agents, tools, tests, memory evaluation, and structured telemetry outputs»
    [section] <header id="topbar">
    [heading-1] <h1>Chat Lab</h1>
    [section] <aside id="config-panel">
    [section] <section id="cfg-section">
    [heading-2] <h2>1. Model and Backend</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>2. Generation and Sampling</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>3. Prompt and Behavior</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>4. Memory and History</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>5. Files and RAG</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>6. Tools and Workflows</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>7. Notebook Logic and Editing</h2>
    [section] <section id="cfg-section">
    [heading-2] <h2>8. Memory Evaluation</h2>
    [section] <main id="chat-main">

structure from chat/node.tasks.json:
    [json-key] project: {name, description, start_date, end_date, status, +1 more}
    [json-key] categories: [4 items]
    [json-key] workers: [1 items]
    [json-key] tasks: [9 items]

structure from chat/schema.json:
    [file-summary] Standalone Chat Lab with 8-section config panel, notebook-style editing, bridge LLM API integration, and quality validation.
    [json-key] id: "chat-lab"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "Chat Lab"
    [json-key] path: "chat"
    [json-key] description: "Standalone Chat Lab with 8-section config panel, notebook-st..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "index.html"
    [json-key] inputs: [0 items]
    [json-key] outputs: [3 items]
    [json-key] errors: [0 items]
    [json-key] features: [6 items]
    [json-key] dependencies: {tools, apis}
    [json-key] files: [4 items]
    [json-key] tests: [1 items]

structure from chat/css/chat-lab.css:
    [css-variable] --bg
    [css-variable] --panel
    [css-variable] --panel-2
    [css-variable] --line
    [css-variable] --text
    [css-variable] --sub
    [css-variable] --accent
    [css-variable] --ok
    [css-variable] --bad
    [selector] #app
    [selector] .topbar
    [selector] .topbar h1
    [selector] .topbar select, .topbar button
    [selector] .topbar button
    [selector] .topbar-status
    [selector] .dot
    [selector] .dot.ok
    [selector] .dot.bad
    [selector] .body
    [selector] .config-panel
    [selector] .config-panel.hidden
    [selector] .cfg-section
    [selector] .cfg-section h2
    [selector] .cfg-section label
    [selector] .cfg-section input[type='file']
    [selector] .cfg-section textarea
    [selector] .cfg-section input[type='checkbox']
    [selector] .help
    [selector] .chat-main
    [selector] .thread
    [selector] .msg
    [selector] .msg.user
    [selector] .msg.assistant
    [selector] .msg-meta
    [selector] .msg-body
    [selector] .msg.user .msg-body
    [selector] .msg-actions
    [selector] .msg-actions button
    [selector] .msg-edit
    [selector] .msg-edit.open
    [selector] .msg-edit textarea
    [selector] .composer
    [selector] .composer textarea
    [selector] .action-row
    [selector] .action-row button
    [selector] .toast
    [selector] .toast.show

structure from chat/js/chat-api.js:
    [file-summary] No top-level file docstring detected
    function fetchCatalog()  «docstring: none»
    function fetchRegistry(endpointBase)  «docstring: none»
    function fetchModelInfo(endpointBase)  «docstring: none»
    function llmComplete(endpointBase, payload)  «docstring: none»
    function saveArtifact(endpointBase, path, filename, content)  «docstring: none»

structure from chat/js/chat-app.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_ENGINE_OPTIONS  «docstring: none»
    function sanitizeBackend(backend)  «docstring: none»
    function renderEngineOptions()  «docstring: none»
    function toast(message)  «docstring: none»
    function readConfigFromUi()  «docstring: none»
    function writeConfigToUi()  «docstring: none»
    function syncSliderLabels()  «docstring: none»
    function selectedProfile(group, id, fallback = {})  «docstring: none»
    function buildContextBlock()  «docstring: none»
    function buildMessages(userPrompt)  «docstring: none»
    function render()  «docstring: none»
    function refreshBridgeStatus()  «docstring: none»
    function sendMessage()  «docstring: none»
    function exportJson(filename, value)  «docstring: none»
    function loadFiles(fileList)  «docstring: none»
    function applyParameterProfile(profileId)  «docstring: none»
    function wireEvents()  «docstring: none»
    function initCatalog()  «docstring: none»
    function main()  «docstring: none»

structure from chat/js/chat-catalog.json:
    [json-key] prompts: [3 items]
    [json-key] agents: [3 items]
    [json-key] tools: [4 items]
    [json-key] tests: [4 items]
    [json-key] parameterProfiles: [3 items]

structure from chat/js/chat-render.js:
    [file-summary] No top-level file docstring detected
    function esc(value)  «docstring: none»
    function renderThread(state, root, handlers)  «docstring: none»
    function fillSelect(select, items, labelField = 'name')  «docstring: none»

structure from chat/js/chat-response-validator.js:
    [file-summary] Chat Quality Validator Integration
    export class ChatResponseValidator  «docstring: none»:
        constructor(options = {})  «docstring: none»
        validateResponse(llmResponse)  «Validate incoming LLM response Returns validation result and optionally flags/blocks poor responses»
        extractValidatedContent(llmResponse)  «Extract content with validation metadata»
        getValidationLog(count = 10)  «Get validation history»
        clearLog()  «Clear validation log»

    function initializeValidator(options = {})  «docstring: none»
    function getValidator()  «docstring: none»

structure from chat/js/chat-state.js:
    [file-summary] No top-level file docstring detected
    const STORE_KEY  «docstring: none»
    function createDefaultState()  «docstring: none»
    function loadState()  «docstring: none»
    function saveState(state)  «docstring: none»

structure from chat/js/chat-telemetry.js:
    [file-summary] No top-level file docstring detected
    function uid(prefix)  «docstring: none»
    function logEvent(state, event, details = {}, level = 'info')  «docstring: none»
    function addTestResult(state, name, passed, details = {})  «docstring: none»
    function buildArtifactBundle(state)  «docstring: none»

structure from chat/js/chat-tests.js:
    [file-summary] No top-level file docstring detected
    const CONFIRMED_BACKENDS  «docstring: none»
    function analyzeAssistantTextQuality(text)  «docstring: none»
    function runChatSurfaceChecks(ui, state)  «docstring: none»

structure from chat/tests/chat-lab.test.js:
    [file-summary] Chat Lab Unit Tests
    function runChatLabTests()  «Chat Lab Unit Tests»

structure from chat/tests/chat-surface.test-plan.json:
    [file-summary] chat-surface-test-plan
    [json-key] name: "chat-surface-test-plan"
    [json-key] version: 1
    [json-key] scope: "public/agentic-ide/chat"
    [json-key] checks: [7 items]
    [json-key] artifactTargets: {browserExport, bridgeArtifactPath}

structure from components/agents/chat-quality-inspector/main.js:
    [file-summary] Chat Quality Inspector Tool
    export class ChatQualityInspector  «Chat Quality Inspector Tool»:
        constructor(options = {})  «docstring: none»
        inspect(llmResponse)  «Main inspection entry point»
        _extractContent(response)  «docstring: none»
        _checkCorruption(content)  «docstring: none»
        _checkRepetition(content)  «docstring: none»
        _checkMeaningfulness(content)  «docstring: none»
        _checkEncoding(content)  «docstring: none»

    function createInspector(options)  «docstring: none»
    function runInspection(llmResponse, options)  «docstring: none»

structure from components/agents/chat-quality-inspector/schema.json:
    [file-summary] Validates LLM responses for quality issues: garbled text, character corruption, repetition patterns, non-UTF8 handling
    [json-key] id: "chat-quality-inspector"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "Chat Quality Inspector"
    [json-key] path: "components/tools/chat-quality-inspector"
    [json-key] description: "Validates LLM responses for quality issues: garbled text, ch..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [2 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]
    [json-key] dependencies: {tools, apis}
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/agents/chat-quality-inspector/test.js:
    [file-summary] Unit tests for Chat Quality Inspector
    function runTests()  «docstring: none»

structure from components/agents/data_processor_v1/prompt.md:
    [file-summary] Input
    [heading-2] ## Input
    [heading-2] ## Instructions
    [heading-2] ## Output Format

structure from components/agents/data_processor_v1/schema.json:
    [file-summary] Turns upstream research notes into concise HTML blocks that downstream tools can validate and render
    [json-key] id: "data_processor"
    [json-key] type: "agent"
    [json-key] version: 1
    [json-key] label: "data_processor"
    [json-key] path: "components/agents/data_processor_v1"
    [json-key] description: "Turns upstream research notes into concise HTML blocks that ..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] model_ref: "gemma_model"
    [json-key] memory_type: "none"
    [json-key] planning: "none"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/agents/data_processor_v1/tests/behavior.json:
    [file-summary] data_processor behavior tests
    [json-key] name: "data_processor behavior tests"
    [json-key] type: "behavior"
    [json-key] target: "data_processor"
    [json-key] cases: [1 items]

structure from components/agents/search_agent_v1/prompt.md:
    [file-summary] Context
    [heading-2] ## Context
    [heading-2] ## Available Tools
    [heading-2] ## Instructions
    [heading-2] ## Output Format

structure from components/agents/search_agent_v1/schema.json:
    [file-summary] LLM agent that plans and executes web searches using ReAct strategy
    [json-key] id: "search_agent"
    [json-key] type: "agent"
    [json-key] version: 1
    [json-key] label: "search_agent"
    [json-key] path: "components/agents/search_agent_v1"
    [json-key] description: "LLM agent that plans and executes web searches using ReAct s..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] model_ref: "gemma_model"
    [json-key] memory_type: "buffer"
    [json-key] planning: "react"
    [json-key] tool_refs: [2 items]
    [json-key] inputs: [1 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/agents/search_agent_v1/tests/behavior.json:
    [file-summary] search_agent behavior tests
    [json-key] name: "search_agent behavior tests"
    [json-key] type: "behavior"
    [json-key] target: "search_agent"
    [json-key] cases: [1 items]

structure from components/inference/README.md:
    [file-summary] AI Inference Isolation Layer
    [heading-1] # AI Inference Isolation Layer
    [heading-2] ## Engines
    [heading-2] ## Why this exists
    [heading-2] ## Current recommendation for the bundled Gemma model
    [heading-2] ## Programmatic usage
    [heading-2] ## Compare Multiple Inference Components

structure from components/inference/main.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_MODEL_PATH  «docstring: none»
    const DEFAULT_TEST_RESULTS_DIR  «docstring: none»
    function readJsonIfExists(filePath)  «docstring: none»
    function getPassingEngineSet(report)  «docstring: none»
    function resolvePrunedEngineIds()  «docstring: none»
    function normalizeContext(context = {})  «docstring: none»
    function buildStaticCompatibilityScore(engineId, context)  «docstring: none»
    function createInferenceManager()  «docstring: none»

structure from components/inference/schema.json:  (no extractable definitions)

structure from components/inference/engines/duck4i-llama/adapter.js:
    [file-summary] No top-level file docstring detected
    function resolvePrompt(payload)  «docstring: none»
    function createDuck4iLlamaEngine()  «docstring: none»

structure from components/inference/engines/hyllama/adapter.js:
    [file-summary] No top-level file docstring detected
    function readGgufHeader(modelPath)  «docstring: none»
    function createHyllamaEngine()  «docstring: none»

structure from components/inference/engines/llama-server-openai/adapter.js:
    [file-summary] No top-level file docstring detected
    function normalizeBaseUrl(input)  «docstring: none»
    function toMessages(payload)  «docstring: none»
    function sanitizeText(text)  «docstring: none»
    function postJson(url, payload, timeoutMs = 20000)  «docstring: none»
    function createLlamaServerOpenAiEngine()  «docstring: none»

structure from components/inference/engines/llama3pure/adapter.js:
    [file-summary] No top-level file docstring detected
    function createLlama3PureEngine()  «docstring: none»

structure from components/inference/engines/llmjs/adapter.js:
    [file-summary] No top-level file docstring detected
    function createLlmJsEngine()  «docstring: none»

structure from components/inference/engines/node-llama-cpp/adapter.js:
    [file-summary] No top-level file docstring detected
    function normalizeBaseUrl(input)  «docstring: none»
    function sanitizeLlmText(text)  «docstring: none»
    function sanitizeCompletionPayload(payload)  «docstring: none»
    function postJson(url, payload, timeoutMs = 20000)  «docstring: none»
    function createNodeLlamaCppEngine()  «docstring: none»

structure from components/inference/engines/webllm/adapter.js:
    [file-summary] No top-level file docstring detected
    function createWebLlmEngine()  «docstring: none»

structure from components/inference/tests/benchmark.js:
    [file-summary] No top-level file docstring detected
    function runInferenceBenchmark(options = {})  «docstring: none»
    function writeBenchmarkReport(report, outPath)  «docstring: none»

structure from components/inference/tests/index.html:
    [file-summary] Inference Test Dashboard
    [title] <title>Inference Test Dashboard</title>
    [section] <main id="wrap">
    [section] <section id="hero">
    [heading-1] <h1>Inference Text + Coding Benchmark Dashboard</h1>
    [section] <section id="summaryCards">
    [section] <section id="card">
    [heading-2] <h2>Active vs Removed Engines</h2>
    [section] <section id="card">
    [heading-2] <h2>Per-Case Leaderboard (Combined CSV)</h2>
    [section] <section id="grid">
    [section] <article id="card">
    [heading-2] <h2>Text Suite Summary</h2>
    [section] <article id="card">
    [heading-2] <h2>Coding Suite Summary</h2>

structure from components/inference/tests/select-best.js:
    [file-summary] No top-level file docstring detected
    const RESULTS_DIR  «docstring: none»
    const KNOWN_ENGINE_IDS  «docstring: none»
    function pickBestReportPath(resultsDir, suitePrefix)  «docstring: none»
    function readJson(filePath)  «docstring: none»
    function csvEscape(value)  «docstring: none»
    function toCsv(rows, headers)  «docstring: none»
    function getEngineStatsMap(report)  «docstring: none»
    function buildCombinedCaseLeaderboard(textReport, codingReport)  «docstring: none»
    function selectEngines(textReport, codingReport)  «docstring: none»
    function runSelection()  «docstring: none»

structure from components/inference/tests/coding/coding_cases.json:
    [file-summary] Sequential JavaScript code-generation benchmark using deterministic execution-based checks inspired by Agentic IDE tool components.
    [json-key] suite_id: "llm_js_coding_execution_v1"
    [json-key] description: "Sequential JavaScript code-generation benchmark using determ..."
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] input_schema: {system_prompt, max_tokens, temperature}
    [json-key] cases: [10 items]

structure from components/inference/tests/coding/run-coding-suite.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_SUITE_PATH  «docstring: none»
    const DEFAULT_RESULTS_DIR  «docstring: none»
    const DEFAULT_ENDPOINT  «docstring: none»
    function readJson(filePath)  «docstring: none»
    function sanitizeText(value)  «docstring: none»
    function trimToExecutablePrefix(candidate)  «docstring: none»
    function extractCode(text, functionName)  «docstring: none»
    function csvEscape(value)  «docstring: none»
    function toCsv(rows, headers)  «docstring: none»
    function buildPrompt(caseEntry, suite)  «docstring: none»
    function deepClone(value)  «docstring: none»
    function createExecutionContext()  «docstring: none»
    function loadCandidateFunction(code, functionName)  «docstring: none»
    function executeTest(context, test)  «docstring: none»
    function compareResult(actual, expect)  «docstring: none»
    function summarizeEngine(run)  «docstring: none»
    function buildTimestamp()  «docstring: none»
    function buildCaseLeaderboardRows(detailRows)  «docstring: none»
    function runCase(manager, engineId, context, suite, caseEntry)  «docstring: none»
    function runSuite(options = {})  «docstring: none»
    function main()  «docstring: none»

structure from components/inference/tests/results/active-engines.json:
    [json-key] generatedAt: "2026-04-29T00:00:30.122Z"
    [json-key] strategy: "keep engines that execute and score accuracy > 0 in both tex..."
    [json-key] sourceReports: {text, coding}
    [json-key] textSuiteId: "llm_unit_parseable_validation_v1"
    [json-key] codingSuiteId: "llm_js_coding_execution_v1"
    [json-key] activeEngines: [1 items]
    [json-key] removedEngines: [6 items]

structure from components/inference/tests/results/combined-case-leaderboard-latest.csv:
    [csv-column] [col 1] suite
    [csv-column] [col 2] caseId
    [csv-column] [col 3] rank
    [csv-column] [col 4] engineId
    [csv-column] [col 5] engineLabel
    [csv-column] [col 6] passed
    [csv-column] [col 7] primaryMs
    [csv-column] [col 8] secondaryMetric
    [csv-column] [col 9] secondaryMetricName
    [csv-column] [col 10] error

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-12-35-774Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] title
    [csv-column] [col 8] sourceComponent
    [csv-column] [col 9] functionName
    [csv-column] [col 10] passed
    [csv-column] [col 11] generationMs
    [csv-column] [col 12] executionMs
    [csv-column] [col 13] codeLength
    [csv-column] [col 14] error
    [csv-column] [col 15] prompt
    [csv-column] [col 16] code

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-12-35-774Z-report.json:
    [json-key] suiteId: "llm_js_coding_execution_v1"
    [json-key] timestamp: "2026-04-28T23:12:35.772Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +9 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]
    [json-key] engineRuns: [7 items]

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-12-35-774Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgGenerationMs
    [csv-column] [col 13] avgExecutionMs
    [csv-column] [col 14] avgCodeLength

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-14-45-582Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] title
    [csv-column] [col 8] sourceComponent
    [csv-column] [col 9] functionName
    [csv-column] [col 10] passed
    [csv-column] [col 11] generationMs
    [csv-column] [col 12] executionMs
    [csv-column] [col 13] codeLength
    [csv-column] [col 14] error
    [csv-column] [col 15] prompt
    [csv-column] [col 16] code

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-14-45-582Z-report.json:
    [json-key] suiteId: "llm_js_coding_execution_v1"
    [json-key] timestamp: "2026-04-28T23:14:45.580Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +9 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]
    [json-key] engineRuns: [7 items]

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-14-45-582Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgGenerationMs
    [csv-column] [col 13] avgExecutionMs
    [csv-column] [col 14] avgCodeLength

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-15-59-946Z-details.csv:
    [csv-column] [col 1] engineId,engineLabel,engineAvailable,engineCanInfer,compatibilityScore,caseId,title,sourceComponent,functionName,passed,generationMs,executionMs,codeLength,error,prompt,code

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-15-59-946Z-report.json:
    [json-key] suiteId: "llm_js_coding_execution_v1"
    [json-key] timestamp: "2026-04-28T23:15:59.945Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +9 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]
    [json-key] engineRuns: [7 items]

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-15-59-946Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgGenerationMs
    [csv-column] [col 13] avgExecutionMs
    [csv-column] [col 14] avgCodeLength

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] generationMs
    [csv-column] [col 7] executionMs
    [csv-column] [col 8] codeLength
    [csv-column] [col 9] error

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] title
    [csv-column] [col 8] sourceComponent
    [csv-column] [col 9] functionName
    [csv-column] [col 10] passed
    [csv-column] [col 11] generationMs
    [csv-column] [col 12] executionMs
    [csv-column] [col 13] codeLength
    [csv-column] [col 14] error
    [csv-column] [col 15] prompt
    [csv-column] [col 16] code

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-report.json:
    [json-key] suiteId: "llm_js_coding_execution_v1"
    [json-key] timestamp: "2026-04-28T23:56:25.126Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +9 more}
    [json-key] engineSummary: [2 items]
    [json-key] detailRows: [20 items]
    [json-key] caseLeaderboardRows: [20 items]
    [json-key] engineRuns: [2 items]

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-25-136Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgGenerationMs
    [csv-column] [col 13] avgExecutionMs
    [csv-column] [col 14] avgCodeLength

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] generationMs
    [csv-column] [col 7] executionMs
    [csv-column] [col 8] codeLength
    [csv-column] [col 9] error

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] title
    [csv-column] [col 8] sourceComponent
    [csv-column] [col 9] functionName
    [csv-column] [col 10] passed
    [csv-column] [col 11] generationMs
    [csv-column] [col 12] executionMs
    [csv-column] [col 13] codeLength
    [csv-column] [col 14] error
    [csv-column] [col 15] prompt
    [csv-column] [col 16] code

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-report.json:
    [json-key] suiteId: "llm_js_coding_execution_v1"
    [json-key] timestamp: "2026-04-28T23:56:54.587Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +9 more}
    [json-key] engineSummary: [1 items]
    [json-key] detailRows: [10 items]
    [json-key] caseLeaderboardRows: [10 items]
    [json-key] engineRuns: [1 items]

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-28T23-56-54-587Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgGenerationMs
    [csv-column] [col 13] avgExecutionMs
    [csv-column] [col 14] avgCodeLength

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] generationMs
    [csv-column] [col 7] executionMs
    [csv-column] [col 8] codeLength
    [csv-column] [col 9] error

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] title
    [csv-column] [col 8] sourceComponent
    [csv-column] [col 9] functionName
    [csv-column] [col 10] passed
    [csv-column] [col 11] generationMs
    [csv-column] [col 12] executionMs
    [csv-column] [col 13] codeLength
    [csv-column] [col 14] error
    [csv-column] [col 15] prompt
    [csv-column] [col 16] code

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-report.json:
    [json-key] suiteId: "llm_js_coding_execution_v1"
    [json-key] timestamp: "2026-04-29T00:00:30.102Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +9 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]
    [json-key] caseLeaderboardRows: [70 items]
    [json-key] engineRuns: [7 items]

structure from components/inference/tests/results/llm_js_coding_execution_v1-2026-04-29T00-00-30-102Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgGenerationMs
    [csv-column] [col 13] avgExecutionMs
    [csv-column] [col 14] avgCodeLength

structure from components/inference/tests/results/llm_js_coding_execution_v1-latest-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] generationMs
    [csv-column] [col 7] executionMs
    [csv-column] [col 8] codeLength
    [csv-column] [col 9] error

structure from components/inference/tests/results/llm_js_coding_execution_v1-latest-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] title
    [csv-column] [col 8] sourceComponent
    [csv-column] [col 9] functionName
    [csv-column] [col 10] passed
    [csv-column] [col 11] generationMs
    [csv-column] [col 12] executionMs
    [csv-column] [col 13] codeLength
    [csv-column] [col 14] error
    [csv-column] [col 15] prompt
    [csv-column] [col 16] code

structure from components/inference/tests/results/llm_js_coding_execution_v1-latest-report.json:
    [json-key] suiteId: "llm_js_coding_execution_v1"
    [json-key] timestamp: "2026-04-29T00:00:30.102Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +9 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]
    [json-key] caseLeaderboardRows: [70 items]
    [json-key] engineRuns: [7 items]

structure from components/inference/tests/results/llm_js_coding_execution_v1-latest-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgGenerationMs
    [csv-column] [col 13] avgExecutionMs
    [csv-column] [col 14] avgCodeLength

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-40-34-056Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-40-34-056Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T22:40:34.055Z"
    [json-key] suitePath: "d:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: null
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-40-34-056Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-42-08-441Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-42-08-441Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T22:42:08.433Z"
    [json-key] suitePath: "d:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-42-08-441Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-43-28-717Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-43-28-717Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T22:43:28.716Z"
    [json-key] suitePath: "d:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-43-28-717Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-57-00-141Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-57-00-141Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T22:57:00.140Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-57-00-141Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-58-36-735Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-58-36-735Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T22:58:36.734Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [70 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T22-58-36-735Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] elapsedMs
    [csv-column] [col 7] outputCharacters
    [csv-column] [col 8] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T23:55:19.022Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [2 items]
    [json-key] detailRows: [24 items]
    [json-key] caseLeaderboardRows: [24 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-55-19-038Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] elapsedMs
    [csv-column] [col 7] outputCharacters
    [csv-column] [col 8] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T23:56:34.471Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [1 items]
    [json-key] detailRows: [12 items]
    [json-key] caseLeaderboardRows: [12 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-56-34-480Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] elapsedMs
    [csv-column] [col 7] outputCharacters
    [csv-column] [col 8] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T23:59:27.245Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [84 items]
    [json-key] caseLeaderboardRows: [84 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-2026-04-28T23-59-27-256Z-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-latest-case-leaderboard.csv:
    [csv-column] [col 1] caseId
    [csv-column] [col 2] rank
    [csv-column] [col 3] engineId
    [csv-column] [col 4] engineLabel
    [csv-column] [col 5] passed
    [csv-column] [col 6] elapsedMs
    [csv-column] [col 7] outputCharacters
    [csv-column] [col 8] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-latest-details.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] engineLabel
    [csv-column] [col 3] engineAvailable
    [csv-column] [col 4] engineCanInfer
    [csv-column] [col 5] compatibilityScore
    [csv-column] [col 6] caseId
    [csv-column] [col 7] prompt
    [csv-column] [col 8] expected
    [csv-column] [col 9] answer
    [csv-column] [col 10] expectedCanonical
    [csv-column] [col 11] actualCanonical
    [csv-column] [col 12] passed
    [csv-column] [col 13] outputCharacters
    [csv-column] [col 14] elapsedMs
    [csv-column] [col 15] error

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-latest-report.json:
    [json-key] suiteId: "llm_unit_parseable_validation_v1"
    [json-key] timestamp: "2026-04-28T23:59:27.245Z"
    [json-key] suitePath: "D:\web\web-github-task-manager\public\agentic-ide\components..."
    [json-key] context: {runtime, modelPath, llmEndpoint, openAiModel}
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] winner: {engineId, label, available, canInfer, status, +8 more}
    [json-key] engineSummary: [7 items]
    [json-key] detailRows: [84 items]
    [json-key] caseLeaderboardRows: [84 items]

structure from components/inference/tests/results/llm_unit_parseable_validation_v1-latest-summary.csv:
    [csv-column] [col 1] engineId
    [csv-column] [col 2] label
    [csv-column] [col 3] available
    [csv-column] [col 4] canInfer
    [csv-column] [col 5] status
    [csv-column] [col 6] reason
    [csv-column] [col 7] casesTotal
    [csv-column] [col 8] casesCompleted
    [csv-column] [col 9] passed
    [csv-column] [col 10] failed
    [csv-column] [col 11] accuracy
    [csv-column] [col 12] avgElapsedMs
    [csv-column] [col 13] avgOutputCharacters

structure from components/inference/tests/text/hello-world-conformance.js:
    [file-summary] No top-level file docstring detected
    const LLAMA_ENDPOINT  «docstring: none»
    const BRIDGE_ENDPOINT  «docstring: none»
    const TIMEOUT_MS  «docstring: none»
    const TEST_PROMPT  «docstring: none»
    const MAX_TOKENS  «docstring: none»
    const ENGINES  «docstring: none»
    function sanitize(text)  «docstring: none»
    function fetchWithTimeout(url, opts)  «docstring: none»
    function postJson(url, body)  «docstring: none»
    function pass(text)  «docstring: none»
    function metrics(text)  «docstring: none»
    function runEngine(engine)  «docstring: none»
    function statusLine(result)  «docstring: none»
    function main()  «docstring: none»

structure from components/inference/tests/text/run-validation-suite.js:
    [file-summary] No top-level file docstring detected
    const DEFAULT_SUITE_PATH  «docstring: none»
    const DEFAULT_RESULTS_DIR  «docstring: none»
    const DEFAULT_ENDPOINT  «docstring: none»
    function readJson(filePath)  «docstring: none»
    function sanitizeText(value)  «docstring: none»
    function canonicalize(value)  «docstring: none»
    function csvEscape(value)  «docstring: none»
    function toCsv(rows, headers)  «docstring: none»
    function buildPrompt(caseEntry, suite)  «docstring: none»
    function runCase(manager, engineId, context, suite, caseEntry)  «docstring: none»
    function summarizeEngine(run)  «docstring: none»
    function buildTimestamp()  «docstring: none»
    function buildCaseLeaderboardRows(detailRows)  «docstring: none»
    function runSuite(options = {})  «docstring: none»
    function main()  «docstring: none»

structure from components/inference/tests/text/validation_cases.json:
    [json-key] suite_id: "llm_unit_parseable_validation_v1"
    [json-key] model: {name, provider, model_alias, model_path, binary_path}
    [json-key] input_schema: {message, system_prompt, history, max_tokens}
    [json-key] output_schema: {text, elapsed_s, output_characters, raw}
    [json-key] cases: [12 items]

structure from components/runtime/schema.json:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/cublas64_12.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/cublasLt64_12.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/cudart64_12.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-base.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-alderlake.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-cannonlake.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-cascadelake.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-cooperlake.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-haswell.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-icelake.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-ivybridge.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-piledriver.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-sandybridge.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-sapphirerapids.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-skylakex.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-sse42.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-x64.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cpu-zen4.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-cuda.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml-rpc.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/ggml.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/libomp140.x86_64.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-batched-bench.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-bench.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-cli.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-common.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-completion.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-fit-params.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-gemma3-cli.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-gguf-split.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-imatrix.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-llava-cli.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-minicpmv-cli.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-mtmd-cli.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-mtmd-debug.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-perplexity.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-quantize.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-qwen2vl-cli.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-results.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-server.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-template-analysis.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-tokenize.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama-tts.exe:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/llama.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/mtmd.dll:  (no extractable definitions)

structure from components/runtime/llama-b8920-win-cuda12.4/rpc-server.exe:  (no extractable definitions)

structure from components/subgraphs/format_info_v1/graph.json:
    [file-summary] Parse and re-render HTML so downstream reports are structured and inspectable
    [json-key] id: "format_tool"
    [json-key] type: "subgraph"
    [json-key] version: 1
    [json-key] label: "format_info"
    [json-key] path: "components/subgraphs/format_info_v1"
    [json-key] description: "Parse and re-render HTML so downstream reports are structure..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] entry: "html_parser"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] nodes: [2 items]
    [json-key] edges: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/subgraphs/format_info_v1/schema.json:
    [file-summary] Subgraph-level contract for formatting pipeline.
    [json-key] id: "format_tool"
    [json-key] version: 1
    [json-key] description: "Subgraph-level contract for formatting pipeline."
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]

structure from components/subgraphs/format_info_v1/state.js:
    [file-summary] state.js — State schema for the format_info subgraph.
    function createState(initial = {})  «docstring: none»

structure from components/subgraphs/format_info_v1/tests/snapshot.json:
    [file-summary] format_tool snapshot tests
    [json-key] name: "format_tool snapshot tests"
    [json-key] type: "snapshot"
    [json-key] target: "format_tool"
    [json-key] cases: [1 items]

structure from components/tools/README.md:  (no extractable definitions)

structure from components/tools/schema.json:  (no extractable definitions)

structure from components/tools/benchmark_result_writer_v1/main.js:
    [file-summary] No top-level file docstring detected
    function bridgeBase()  «docstring: none»
    function slugify(value)  «docstring: none»
    function toDurationMs(startedAt, fallback)  «docstring: none»
    function round(value, digits = 2)  «docstring: none»
    function clamp(value, min = 0, max = 100)  «docstring: none»
    function safeJsonParse(text, fallback = null)  «docstring: none»
    function countMatches(text, regex)  «docstring: none»
    function normalizeTopicTerms(topic)  «docstring: none»
    function delta(currentValue, previousValue)  «docstring: none»
    function pctDelta(currentValue, previousValue)  «docstring: none»
    function shouldSkipHistoryReads()  «docstring: none»
    function fetchJson(relativePath)  «docstring: none»
    function persistRecord(relativePath, record)  «docstring: none»
    function computeComponentScore(component, totalDurationMs)  «docstring: none»
    function summarizeComponents(steps, executedNodes)  «docstring: none»
    function computeQualitySignals(htmlReport, topic, runtimeOutput)  «docstring: none»
    function computeMetrics(meta, htmlReport, steps, components, qualitySignals)  «docstring: none»
    function computeFeedback(qualitySignals, metrics, htmlReport)  «docstring: none»
    function computeScorecard(metrics, qualitySignals, feedback)  «docstring: none»
    function loadPreviousRecord(currentRecord)  «docstring: none»
    function compareComponents(currentComponents, previousComponents)  «docstring: none»
    function buildComparison(currentRecord, previousEntry)  «docstring: none»
    function buildImprovementCandidates(record)  «docstring: none»
    function run(topic, report, benchmarkName, runLabel, startedAt, benchmarkMeta)  «docstring: none»

structure from components/tools/benchmark_result_writer_v1/schema.json:
    [file-summary] Persists benchmark outputs and feedback for live local-model workflow runs.
    [json-key] id: "benchmark_result_writer"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "benchmark_result_writer"
    [json-key] path: "components/tools/benchmark_result_writer_v1"
    [json-key] description: "Persists benchmark outputs and feedback for live local-model..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 1
    [json-key] impl: "main.js"
    [json-key] inputs: [6 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/tools/benchmark_result_writer_v1/tests/unit.json:
    [file-summary] benchmark_result_writer unit tests
    [json-key] name: "benchmark_result_writer unit tests"
    [json-key] type: "unit"
    [json-key] target: "benchmark_result_writer"
    [json-key] cases: [1 items]

structure from components/tools/folder-graph-scanner/main.js:
    [file-summary] Folder Graph Scanner Scans a folder structure and extracts relations to build a code.graph.json
    const SCANNER_CONFIG  «Configuration for scanner behavior»
    class FolderNode  «Represents a folder layer in the graph»:
        constructor(folderPath, parentId = null)  «docstring: none»
        generateId(folderPath)  «docstring: none»

    class FileNode  «Represents a file/component node in the graph»:
        constructor(filePath, parentLayerId)  «docstring: none»
        generateId(filePath)  «docstring: none»
        detectType(filePath)  «docstring: none»

    class GraphEdge  «Represents an edge/relation between nodes»:
        constructor(sourceId, targetId, type = 'depends_on', metadata = {})  «docstring: none»

    export class FolderGraphScanner  «Main scanner class»:
        constructor(rootPath, options = {})  «docstring: none»
        async scan()  «Main scanning entry point»
        async scanFolder(folderPath, parentLayerId, currentDepth)  «Recursively scan a folder and its contents»
        async scanFile(filePath, parentLayerId)  «Process a single file»
        async processReadme(filePath, parentLayerId)  «Extract README as layer description»
        async processTasks(filePath, parentLayerId)  «Extract tasks from node.tasks.json»
        async analyzeFile(filePath, fileNodeId)  «Analyze imports and dependencies in a code file»
        inferIOPatterns(fileNode)  «Infer input/output patterns from file structure»
        async analyzeDependencies()  «Analyze dependencies between files and create edges»
        toCodeGraph()  «Export as code.graph.json format»

    function scanFolderToGraph(folderPath, options = {})  «Helper function to scan a folder and return code.graph.json»

structure from components/tools/folder-graph-scanner/schema.json:
    [file-summary] Scans a folder structure and extracts node/edge relations to build a code.graph.json. Maps hierarchy to layer nodes, extracts task nodes from node.tasks.json, and analyzes import chains for data-flow 
    [json-key] id: "folder_graph_scanner"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "Folder Graph Scanner"
    [json-key] path: "components/tools/folder-graph-scanner"
    [json-key] description: "Scans a folder structure and extracts node/edge relations to..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [2 items]
    [json-key] outputs: [4 items]
    [json-key] errors: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [0 items]

structure from components/tools/folder-graph-scanner/ui/main.js:
    [file-summary] Folder Graph Scanner UI Integration Provides UI components to integrate the folder scanner into the graph designer
    function initFolderScannerUI()  «Initialize folder scanner UI»
    function wireScanner()  «Wire up scanner UI events»
    function getNodeTypeSummary(graph)  «Get summary of node types in the graph»
    function applyGraphToEditor(codeGraph)  «Apply discovered graph to the editor state»
    function showFolderScannerUI()  «Show the scanner panel»

structure from components/tools/html_parser_v1/main.js:
    [file-summary] main.js — html_parser_v1
    const STRIP  «main.js — html_parser_v1»
    strip = (s) =>  «docstring: none»
    function run(html = '')  «docstring: none»

structure from components/tools/html_parser_v1/schema.json:
    [file-summary] Parses HTML into a structured document object
    [json-key] id: "html_parser"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "html_parser"
    [json-key] path: "components/tools/html_parser_v1"
    [json-key] description: "Parses HTML into a structured document object"
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/tools/html_parser_v1/tests/unit.json:
    [file-summary] html_parser unit tests
    [json-key] name: "html_parser unit tests"
    [json-key] type: "unit"
    [json-key] target: "html_parser"
    [json-key] cases: [1 items]

structure from components/tools/research_benchmark_runner_v1/main.js:
    [file-summary] No top-level file docstring detected
    function bridgeBase()  «docstring: none»
    function normalizeTopic(topic)  «docstring: none»
    function fetchJson(relativePath, options = {})  «docstring: none»
    function readModelStatus()  «docstring: none»
    function run(topic, benchmarkName, runLabel, startedAt)  «docstring: none»

structure from components/tools/research_benchmark_runner_v1/schema.json:
    [file-summary] Runs the research_workflow through the live bridge to collect real inference latency and output data.
    [json-key] id: "research_benchmark_runner"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "research_benchmark_runner"
    [json-key] path: "components/tools/research_benchmark_runner_v1"
    [json-key] description: "Runs the research_workflow through the live bridge to collec..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 1
    [json-key] impl: "main.js"
    [json-key] inputs: [4 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]
    [json-key] files: [2 items]
    [json-key] tests: [0 items]

structure from components/tools/result_ranker_v1/main.js:
    [file-summary] main.js — result_ranker_v1
    function score(item)  «docstring: none»
    function run(results)  «docstring: none»

structure from components/tools/result_ranker_v1/schema.json:
    [file-summary] Ranks and filters search results by heuristic relevance score
    [json-key] id: "result_ranker"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "result_ranker"
    [json-key] path: "components/tools/result_ranker_v1"
    [json-key] description: "Ranks and filters search results by heuristic relevance scor..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/tools/result_ranker_v1/tests/unit.json:
    [file-summary] result_ranker unit tests
    [json-key] name: "result_ranker unit tests"
    [json-key] type: "unit"
    [json-key] target: "result_ranker"
    [json-key] cases: [1 items]

structure from components/tools/ui_renderer_v1/main.js:
    [file-summary] main.js — ui_renderer_v1
    esc = (s) =>  «main.js — ui_renderer_v1»
    function run(doc)  «docstring: none»

structure from components/tools/ui_renderer_v1/schema.json:
    [file-summary] Renders a structured document object as presentable HTML
    [json-key] id: "ui_renderer"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "ui_renderer"
    [json-key] path: "components/tools/ui_renderer_v1"
    [json-key] description: "Renders a structured document object as presentable HTML"
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]
    [json-key] files: [4 items]
    [json-key] tests: [1 items]

structure from components/tools/ui_renderer_v1/template.html:
    [file-summary] {{title}}
    [title] <title>{{title}}</title>

structure from components/tools/ui_renderer_v1/tests/snapshot.json:
    [file-summary] ui_renderer snapshot tests
    [json-key] name: "ui_renderer snapshot tests"
    [json-key] type: "snapshot"
    [json-key] target: "ui_renderer"
    [json-key] cases: [1 items]

structure from components/tools/web_search_v1/main.js:
    [file-summary] main.js — web_search_v1
    const API_BASE  «main.js — web_search_v1»
    const API_KEY  «docstring: none»
    function run(query, top_k = 5)  «Fetch search results for query, returning at most top_k items.»

structure from components/tools/web_search_v1/schema.json:
    [file-summary] Calls a search API and returns result snippets
    [json-key] id: "web_search_tool"
    [json-key] type: "tool"
    [json-key] version: 1
    [json-key] label: "web_search_tool"
    [json-key] path: "components/tools/web_search_v1"
    [json-key] description: "Calls a search API and returns result snippets"
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] impl: "main.js"
    [json-key] api_endpoint: "https://api.search.io/v1"
    [json-key] auth: "api_key"
    [json-key] inputs: [2 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from components/tools/web_search_v1/tests/unit.json:
    [file-summary] web_search_tool unit tests
    [json-key] name: "web_search_tool unit tests"
    [json-key] type: "unit"
    [json-key] target: "web_search_tool"
    [json-key] cases: [2 items]

structure from js/README.md:  (no extractable definitions)

structure from js/bridge-server.js:
    [file-summary] No top-level file docstring detected
    const PORT  «HTTP port for the local Agentic IDE bridge server.»
    const ROOT  «Absolute root folder for bridge file access.»
    const INFERENCE_RESULTS_DIR  «docstring: none»
    const LLM_HOST  «Hostname for the local llama.cpp inference endpoint.»
    const LLM_PORT  «Port for the local llama.cpp inference endpoint.»
    const INFERENCE_ENGINE  «Preferred isolated inference engine id.»
    const MIME  «File extension MIME type mapping for allowed static file responses.»
    function readJsonIfExists(filePath)  «docstring: none»
    function getActiveInferenceManifest()  «docstring: none»
    function getAvailableEngineDescriptors()  «docstring: none»
    function resolveInferenceEngine(payload = {})  «docstring: none»
    function safePath(relPath)  «Resolve a relative path under ROOT and block path traversal.»
    function cors(res)  «Enable permissive CORS headers for bridge responses.»
    function json(res, code, obj)  «Send a JSON response with the given HTTP status code.»
    function readBody(req, limit = 5_000_000)  «Read the full request body as text with an optional size limit.»
    function requestLlmCompletion(payload)  «Forward a completion request to the local LLM endpoint and return parsed JSON.»
    function getWorkspaceRegistry()  «Discover the Agentic IDE workspace registry from the local root.»
    function makeEtag(body)  «Generate an ETag string for a response body.»
    function getModelAssetInfo(model)  «Return full asset path and existence info for a model definition.»
    function buildInferencePayload()  «docstring: none»
    function getRegistrySnapshot(force = false)  «Load the latest workspace registry and model status, with caching.»
    function replyCachedJson(req, res, body, etag)  «Reply with cached JSON and ETag support for HEAD / conditional requests.»

structure from js/bridge-workspace.js:
    [file-summary] No top-level file docstring detected
    const RESERVED_NODE_KEYS  «Reserved component metadata keys excluded from extracted node meta.»
    const NODE_DIMENSIONS  «Default canvas size presets for each node kind.»
    const TEXT_FILE_DENYLIST  «Binary or non-text file extensions excluded from editor file discovery.»
    const ROOT_NODE_ID  «Identifier for the workspace root node.»
    function toPosix(value)  «Normalize a path value to POSIX separators.»
    function exists(absPath)  «Check whether the given absolute path exists on disk.»
    function readText(absPath)  «Read a UTF-8 text file from disk.»
    function sha1(value)  «Compute a SHA-1 fingerprint for a string.»
    function parseJson(absPath)  «Parse JSON from a file path, returning an empty object if missing.»
    function stringifyMeta(value)  «Convert metadata values into a normalized string form.»
    function normalizePorts(items)  «Normalize port definitions into {n,t} objects.»
    function normalizeStringList(items)  «Normalize a list of values into a cleaned string array.»
    function normalizeRefList(items)  «Normalize a list of file or component references to POSIX paths.»
    function inferType(definitionName, relDir, explicitType)  «Infer the component kind from the definition filename or folder.»
    function isEditableFile(relPath)  «Determine whether a relative file path is safe to edit and display as text.»
    function walkFiles(absDir, baseDir = absDir, acc = [])  «Recursively collect relative file paths from a directory tree.»
    function collectEditableFiles(rootDir, relDir)  «List editable files for a component or workflow folder.»
    function collectTests(doc, files)  «Merge declared and discovered test file references for a component.»
    function inferLabel(doc, fallbackId)  «Derive a human-friendly label for a node from metadata or fallback ID.»
    function getNodeSize(type)  «Return the default dimensions for a node type.»
    function extractMeta(doc, type)  «Extract non-reserved metadata from a component definition.»
    function createNode({ doc, type, relDir, files, tests })  «Build a workspace node object from a component or workflow definition.»
    function sortByTypeAndLabel(a, b)  «Sort workspace nodes by type precedence and label.»
    function walkDefinitions(rootDir)  «Discover component and workflow definition files under the workspace root.»
    function roleForFile(file)  «Determine a user-facing file role for workspace browsing and editing.»
    function inferFileType(file)  «Infer a simplified file type from a filename.»
    function slugForFile(file)  «Create a normalized slug from an arbitrary filename.»
    function pushSymbol(target, type, name)  «Register a source code symbol in a file node if not already present.»
    function extractSymbolsForFile(absPath, file)  «Extract top-level symbols from a file for quick navigation.»
    function createFileNode(rootDir, parentNode, file)  «Create a file node object for a component file inside the workspace graph.»
    function buildNodeExecutionMeta(ctx, nodeId)  «Build cached execution metadata for a component node.»
    function collectExecutedNodeMetadata(ctx, steps = [])  «Aggregate execution metadata from runtime steps into node summaries.»
    function buildRunFingerprint(executedNodes = [])  «Build a stable fingerprint for a run from executed node metadata.»
    function ensureEdgeRefs(nodes, edge)  «Ensure edge references are stored on source and destination nodes.»
    function addFileEdges(nodes, edges, parentNode, fileNodeIds, nextIndexRef)  «Create edges between file nodes and their owning component.»
    function buildWorkspace(rootDir, runtimeOptions = {})  «Build the full Agentic IDE workspace graph from filesystem definitions.»
    function assignLayout(nodes)  «Assign default canvas positions for nodes in the workspace graph.»
    function layoutChildren(nodes, parentNode, depth)  «Recursively position child nodes beneath their parent on the canvas.»
    function escapeTemplateValue(value)  «Escape a prompt variable value for safe injection into templates.»
    function renderPromptTemplate(template, variables)  «Render a prompt template by replacing {{variables}} with provided values.»
    function primaryOutputName(node)  «Return the default output port name for a node when only one output exists.»
    function normalizeExecutionOutput(node, value)  «Normalize a component return value into an output object keyed by port name.»
    function parseEdgeMapping(mapping)  «Parse simple edge mapping strings like source->target or source→target.»
    function createMockFetch(mockSpec)  «Create a mock fetch implementation for unit test runtime execution.»
    function withMockEnv(mockEnv, work)  «Temporarily set environment variables for a test execution block.»
    function loadRunFunction(absPath, runtimeOptions = {})  «Load and compile a component's main JS module for runtime execution.»
    function buildNodeInput(node, inputState)  «Build a node input object from provided values matching declared ports.»
    function extractSingleValue(obj)  «Extract a single value from a single-key object, or return the object unchanged.»
    function extractLlmText(payload)  «Extract the most likely text field from a model response payload.»
    function invokeModel(ctx, modelId, prompt, runtimeOptions, logs)  «Invoke the configured model bridge and normalize the returned text.»
    function runToolComponent(ctx, def, input, runtimeOptions, logs)  «Execute a tool component by loading its main.js entrypoint.»
    function runAgentComponent(ctx, def, input, runtimeOptions, logs, stack)  «Execute an agent component by rendering its prompt and calling the LLM.»
    function buildCompositeInput(childNode, initialInput, state, resultsByNode, incomingEdges)  «Construct child node input from upstream state and edge mappings.»
    function runCompositeComponent(ctx, def, input, runtimeOptions, logs, stack)  «Execute a composite workflow/subgraph node by running its children.»
    function executeNode(ctx, nodeId, input = {}, runtimeOptions = {}, logs = [], stack = [])  «Execute a workspace node with runtime arguments, logging, and cycle detection.»
    function assertType(actual, expectedType, label)  «Assert that a runtime value matches an expected type, throwing on mismatch.»
    function assertExpectation(actual, expected, label)  «Assert that a runtime output satisfies an expected condition or schema.»
    function createMockLlmResponder(mockSpec, sequenceSpec)  «Create a mock LLM responder for test cases with fixed or sequenced values.»
    function createRuntimeOptions(baseOptions, testCase)  «Build execution runtime options from base settings and a test case override.»
    function discoverWorkspace(rootDir)  «Discover workspace metadata and graph structure from a root directory.»
    function runComponent(rootDir, nodeId, input = {}, runtimeOptions = {})  «Run a single component node in the workspace and return runtime results.»
    function runComponentTests(rootDir, nodeId, runtimeOptions = {})  «Execute paired tests for a workspace component node and report pass/fail results.»

structure from js/bridge.js:
    [file-summary] Base URL for the local Agentic IDE bridge API.
    const BRIDGE_BASE  «Base URL for the local Agentic IDE bridge API.»
    export class RegistryWatchdog  «Watch the bridge registry for changes and notify UI callbacks.»:
        constructor(config = {})  «docstring: none»
        async initialize()  «Initialize the watchdog and load the latest registry snapshot.»
        async forceRefresh()  «Force a registry refresh and notify listeners.»
        destroy()  «Stop watching DOM triggers and clean up listeners.»
        _registerTriggers()  «Register DOM triggers to refresh the registry when the app state changes.»
        async _check(trigger)  «Poll the bridge and reload registry data when conditions allow.»
        _setBridgeOnline(online)  «Update online/offline status and notify listeners if changed.»

    function getCacheEntry(key)  «Get the cache entry object for a named bridge resource.»
    function fetchCachedJson(key, endpoint, { force = false, ttlMs = 2000 } = {})  «Fetch JSON from the bridge with ETag caching and optional TTL overrides.»
    function getCachedEtag(key)  «Get the current cached ETag for a bridge resource key.»
    function getRegistry(options = {})  «Get the workspace registry from the bridge, with optional caching controls.»
    function getModelInfo(options = {})  «Get model asset and status information from the bridge.»
    function readFile(componentPath, filename)  «Read a component file through the bridge file API.»
    function writeFile(componentPath, filename, content)  «Write a component file to the bridge file API.»
    function listFiles(componentPath)  «List files in a component folder using the bridge API.»
    function llmComplete(prompt, options = {})  «Send a prompt to the bridge LLM completion endpoint and return text.»
    function runRuntimeNode(nodeId, input = {}, options = {})  «Run a workspace node through the bridge runtime API.»
    function runRuntimeTests(nodeId, options = {})  «Run tests for a workspace component via the bridge runtime API.»
    function checkBridge()  «Check whether the bridge and LLM endpoints are reachable.»

structure from js/export.js:
    [file-summary] Export helper and JSON preview wiring for Agentic IDE.
    function downloadJSON(json, filename)  «Trigger a browser download for a JSON document.»
    function wireExport()  «Wire export buttons for JSON preview, Graph Display conversion, and import.»

structure from js/main.js:
    [file-summary] No top-level file docstring detected
    const CHAT_PRESETS  «docstring: none»
    function renderGlobalControls()  «docstring: none»
    function applyLayoutStyles()  «docstring: none»
    function setupSplitter(handleId, onMove)  «docstring: none»
    function setupLayoutSplitters()  «docstring: none»
    function syncMobileScrim()  «docstring: none»
    function closeMobilePanels()  «docstring: none»
    function toggleMobilePanel(id)  «docstring: none»
    function wireMobilePanels()  «docstring: none»
    function chatPresetText(preset)  «docstring: none»
    function selectedChatOwnerNodeId()  «docstring: none»
    function chatEligibleNodes()  «docstring: none»
    function defaultChatContextIds(nodeId)  «docstring: none»
    function syncChatStateFromControls({ persist = true } = {})  «docstring: none»
    function renderChatConfigurator()  «docstring: none»
    function latestRuntimeReportFor(nodeIds)  «docstring: none»
    function summarizeNodeForChat(node)  «docstring: none»
    function summarizeRuntimeReport(report)  «docstring: none»
    function sanitizeChatFilename(value)  «docstring: none»
    function saveLatestChatReply()  «docstring: none»
    function runChatTargetTests()  «docstring: none»
    function renderChatThread()  «docstring: none»
    function openChatModal()  «docstring: none»
    function closeChatModal()  «docstring: none»
    function buildChatPrompt(nextPrompt)  «docstring: none»
    function buildConstrainedPrompt(originalPrompt, qualityIssues = [])  «docstring: none»
    function sendChatMessage()  «docstring: none»
    function wireChatModal()  «docstring: none»
    function refreshBridgeStatus()  «docstring: none»
    function applyRegistry(registry, { showToast = false, trigger = 'init' } = {})  «docstring: none»
    function initializeWorkspace()  «docstring: none»

structure from js/modals.js:
    [file-summary] No top-level file docstring detected
    function openNodeModal(editId=null)  «docstring: none»
    function updateNodeModalExtra()  «docstring: none»
    function openEdgeModal()  «docstring: none»
    function wireModals()  «docstring: none»

structure from js/render.js:
    [file-summary] No top-level file docstring detected
    const _drag  «docstring: none»
    const _resize  «docstring: none»
    const _sidebarTab  «docstring: none»
    const _treeOpen  «docstring: none»
    const _canvasZoom  «docstring: none»
    const _canvasRenderQueued  «docstring: none»
    const _pan  «docstring: none»
    function requestCanvasRender()  «docstring: none»
    function wireCanvasInteractions(svg)  «docstring: none»
    function getTasksIntegrationConfig()  «docstring: none»
    function resolveTasksUrl(base, relativePath)  «docstring: none»
    function setSidebarTab(tab)  «Switch sidebar view ('library' = component registry, 'graph' = graph hierarchy).»
    function svgPtInner(e)  «docstring: none»
    function setupDragEvents(saveStateFn)  «Wire document-level drag events. Call once from main.js.»
    function typeRank(type)  «docstring: none»
    function childNodesOfId(nodeId)  «docstring: none»
    function buildScopeCrumbs(scopeId)  «docstring: none»
    function setScope(scopeId)  «docstring: none»
    function getFileNode(nodeId, file)  «docstring: none»
    function hasVisibleFiles(node)  «docstring: none»
    function hasVisibleChildren(node)  «docstring: none»
    function isTreeOpen(nodeId)  «docstring: none»
    function ensureTreePathVisible(nodeId)  «docstring: none»
    function toggleTreeNode(nodeId)  «docstring: none»
    function libraryEntryRank(kind)  «docstring: none»
    function createLibraryEntry(id, kind, label, extra = {})  «docstring: none»
    function ensureLibraryFolder(parent, segment, fullPath)  «docstring: none»
    function buildFileSymbolEntries(nodeId, file)  «docstring: none»
    function buildComponentFileTree(node)  «docstring: none»
    function buildLibraryTree()  «docstring: none»
    function renderLibraryEntry(entry, depth = 0)  «docstring: none»
    function renderSidebarNode(node, depth, { showTypeLabel = false, includeChildren = false } = {})  «docstring: none»
    function renderLibrarySidebar()  «docstring: none»
    function renderGraphSidebar()  «docstring: none»
    function editorLanguage(file)  «docstring: none»
    function highlightEditorLine(line, lang)  «docstring: none»
    function renderEditorHighlight(text, file)  «docstring: none»
    function syncEditorHighlight(textarea, highlight, file)  «docstring: none»
    function renderSidebar()  «docstring: none»
    function zoomCanvas(factor, cx, cy)  «Zoom the canvas by `factor` around viewport point (cx, cy). When cx/cy are omitted the viewport centre is used.»
    function centerCanvas()  «docstring: none»
    function renderCanvas()  «docstring: none»
    function renderCrumbs()  «docstring: none»
    function renderInspector()  «docstring: none»
    function renderNodeInspector(n)  «docstring: none»
    function renderEdgeInspector(e)  «docstring: none»
    function renderFileInspector(nodeId, file)  «docstring: none»
    function saveInspector(nodeId)  «docstring: none»
    function renderBottom()  «docstring: none»
    function renderJson(n, metaOnly = false)  «docstring: none»
    function renderCode(n, file)  «docstring: none»
    function renderEdgeJson(e)  «docstring: none»
    function showText(text, lang='json')  «docstring: none»
    function showLines(lines, lang)  «docstring: none»
    function selectedRuntimeNode()  «docstring: none»
    function buildDefaultRuntimeInput(node)  «docstring: none»
    function reportSummary(report)  «docstring: none»
    function handleRuntimeRun(nodeId)  «docstring: none»
    function handleRuntimeTests(nodeId)  «docstring: none»
    function renderStepsTable(steps)  «docstring: none»
    function renderCaseRow(tc)  «docstring: none»
    function renderTestsPanel()  «docstring: none»
    function collectIssues()  «docstring: none»
    function renderIssuesPanel()  «docstring: none»
    function renderFileEditor(nodeId, file)  «Show file content as an editable textarea in the bottom panel.»
    function renderTasksPanel()  «Render the Tasks integration panel in the bottom panel.»
    function loadTasksForPanel(entries, projectId, config = {})  «docstring: none»
    function addTaskNode(td)  «docstring: none»
    function selectNode(id)  «docstring: none»
    function selectEdge(id)  «docstring: none»
    function navigateToNode(id, options = {})  «docstring: none»
    function openFile(nodeId, file)  «docstring: none»
    function drillIn(id)  «docstring: none»
    function renderAll()  «docstring: none»
    function deleteNode(id)  «docstring: none»
    function deleteEdge(id)  «docstring: none»

structure from js/schema-preview.js:
    [file-summary] schema-preview.js — JSON schema preview modal.
    const _previewFilename  «docstring: none»
    function openSchemaPreview(title, jsonStr)  «docstring: none»
    function wireSchemaPreview()  «docstring: none»
    function _downloadText(text, filename)  «docstring: none»
    function _toast(msg)  «docstring: none»

structure from js/state.js:
    [file-summary] No top-level file docstring detected
    const STORE_KEY  «docstring: none»
    const S  «docstring: none»
    function createRootNode()  «docstring: none»
    function createEmptyGraph()  «docstring: none»
    function createDefaultChatState()  «docstring: none»
    function cloneGraph(graph)  «docstring: none»
    function readPersistedState()  «docstring: none»
    function buildCrumbs(scopeId, nodes)  «docstring: none»
    function loadState()  «docstring: none»
    function saveState()  «docstring: none»
    function applyRegistryGraph(graph)  «docstring: none»
    function setBridgeStatus(status)  «docstring: none»
    function addRuntimeReport(report)  «docstring: none»
    function clearRuntimeReports()  «docstring: none»
    function addChatMessage(message)  «docstring: none»
    function clearChatHistory()  «docstring: none»
    function clearState(renderAll, forceBlank = false)  «docstring: none»

structure from js/types.js:
    [file-summary] No top-level file docstring detected
    const CT  «docstring: none»
    const TYPE_META  «docstring: none»
    const DEF_FILES  «docstring: none»
    const CODE_TPL  «docstring: none»

structure from js/utils.js:
    [file-summary] No top-level file docstring detected
    const BRIDGE_BASE  «docstring: none»
    esc = (s) =>  «docstring: none»
    ct = (t) =>  «docstring: none»
    uid = (p) =>  «docstring: none»
    childrenOf = (scope) =>  «docstring: none»
    structuredCloneSafe = (value) =>  «docstring: none»
    edgesInScope = (scope) =>  «docstring: none»
    function parsePorts(str)  «docstring: none»
    function toast(msg, dur=2200)  «docstring: none»
    function mkSvg(tag)  «docstring: none»
    function svgTxt(p,text,x,y,sz,fill,w,anchor)  «docstring: none»
    function svgPt(e)  «docstring: none»
    function loadFileContent(nodePath, filename)  «Fetch file content — tries bridge first (supports write-back), falls back to main dev server static serving. Returns the»

structure from schema/component.schema.json:
    [file-summary] Agentic IDE Component Contract
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "agentic-ide/component.schema.json"
    [json-key] title: "Agentic IDE Component Contract"
    [json-key] type: "object"
    [json-key] required: [9 items]
    [json-key] properties: {id, type, version, label, path, +7 more}
    [json-key] additionalProperties: true

structure from schema/unit-case.schema.json:
    [file-summary] Agentic IDE Test Case Contract
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "agentic-ide/unit-case.schema.json"
    [json-key] title: "Agentic IDE Test Case Contract"
    [json-key] type: "object"
    [json-key] required: [4 items]
    [json-key] properties: {name, type, target, cases}
    [json-key] additionalProperties: true

structure from tests/inference-debug.js:
    [file-summary] No top-level file docstring detected
    const LLM_HOST  «docstring: none»
    const LLM_PORT  «docstring: none»
    const BRIDGE_HOST  «docstring: none»
    const BRIDGE_PORT  «docstring: none»
    function testLlamaConnection()  «Step 1: Test direct connection to llama.cpp»
    function testLlamaCompletion(prompt)  «Step 2: Send simple completion request to llama.cpp»
    function testBridgeCompletion(prompt)  «Step 3: Test bridge server completion endpoint»
    function analyzeCompletion(text)  «Analyze completion for quality issues»
    function compareResponses(llamaResult, bridgeResult)  «Compare responses from both endpoints»
    function runDebugger()  «Main debug flow»

structure from tests/inference-quality-test.js:
    [file-summary] No top-level file docstring detected
    const BRIDGE_BASE  «docstring: none»
    const LLM_TIMEOUT  «docstring: none»
    function extractMathAnswer(response)  «Simple math answer extractor Tries to find numerical answer in the response»
    function analyzeResponseQuality(response, options = {})  «Analyze response for quality issues (corruption, encoding, etc.)»
    function runInferenceTest(testName, prompt, expectedAnswer, options = {})  «Run a single inference test with detailed logging»
    function runAllTests()  «Run full test suite»

structure from tests/test-inference.ps1:  (no extractable definitions)

structure from ui/README.md:  (no extractable definitions)

structure from ui/style.css:
    [file-summary] Design tokens (warm palette, composer inspired)
    [section] /* === Design tokens (warm palette, composer-inspired) === */
    [css-variable] --bg-page
    [css-variable] --bg-panel
    [css-variable] --bg-canvas
    [css-variable] --border
    [css-variable] --text
    [css-variable] --muted
    [css-variable] --sub
    [css-variable] --accent
    [css-variable] --accent-hi
    [css-variable] --danger
    [css-variable] --shadow
    [css-variable] --r
    [css-variable] --r-sm
    [css-variable] --mono
    [css-variable] --sans
    [css-variable] --sidebar-w
    [css-variable] --inspector-w
    [css-variable] --bottom-h
    [section] /* === Header === */
    [selector] .page-header
    [selector] .hdr-brand
    [selector] .eyebrow
    [selector] .page-header h1
    [selector] .hdr-actions
    [selector] .mobile-only
    [section] /* === Buttons === */
    [selector] .btn
    [selector] .btn:hover
    [selector] .btn-accent
    [selector] .btn-accent:hover
    [selector] .btn-danger
    [selector] .btn-danger:hover
    [selector] .btn-sm
    [selector] .btn-icon
    [selector] .ide-shell
    [section] /* === Sidebar === */
    [selector] #sidebar
    [selector] .panel-hdr
    [selector] .panel-hdr-actions
    [selector] #tree
    [selector] .ti
    [selector] .ti:hover
    [selector] .ti.is-sel
    [selector] .ti-grp
    [selector] .ti-grp:hover
    [selector] .ti-node,.ti-file
    [selector] .ti-folder,.ti-symbol
    [selector] .ti-label
    [selector] .ti-toggle
    [selector] .ti-toggle.is-empty
    [selector] .ti-file
    [selector] .dot
    [selector] .dot-file
    [selector] .dot-symbol
    [selector] .splitter
    [selector] .splitter::before
    [selector] .splitter.is-active::before
    [selector] .splitter-v
    [selector] .splitter-v::before
    [selector] .splitter-h
    [selector] .splitter-h::before
    [section] /* === Center column === */
    [selector] .center-col
    [selector] #canvas-toolbar
    [selector] #crumbs
    [selector] .runtime-controls
    [selector] .runtime-label
    [selector] #global-model-select
    [selector] .status-badge
    [selector] .status-badge.is-online
    [selector] .status-badge.is-offline
    [selector] .status-badge.is-pending
    [selector] .crumb
    [selector] .crumb:hover
    [selector] .crumb-sep
    [selector] .crumb-cur
    [selector] .canvas-actions
    [selector] #canvas-area
    [selector] #g
    [section] /* === Bottom panel === */
    [selector] #bottom-panel
    [selector] #bottom-tabs
    [selector] .btab
    [selector] .btab.active
    [selector] #bottom-content
    [selector] .code-line
    [selector] .ln
    [selector] .kw
    [section] /* === File editor (in bottom panel) === */
    [selector] .file-editor-wrap
    [selector] .file-editor-hdr
    [selector] .file-editor-path
    [selector] .file-editor-body
    [selector] .file-editor-ta
    [selector] .file-editor-hl
    [selector] .file-editor-ta::placeholder
    [selector] .file-editor-ta:focus
    [selector] .file-editor-ta::selection
    [section] /* === Right panel === */
    [selector] #right-panel
    [selector] #inspector
    [selector] .ifield
    [selector] .ilabel
    [selector] .ivalue-mono
    [selector] .io-edit-row
    [selector] .flink
    [selector] .flink:hover
    [selector] .edge-pill
    [selector] .iactions
    [selector] .insp-section
    [selector] .placeholder
    [selector] .insp-input
    [selector] .insp-input:focus
    [selector] .insp-ta
    [selector] .badge
    [selector] .b-workflow
    [selector] .b-tool
    [selector] .b-file
    [selector] .b-prompt
    [selector] .b-sub
    [selector] .b-test
    [section] /* === Modals === */
    [selector] .modal-back
    [selector] .modal-back[hidden]
    [selector] .modal-card
    [selector] .modal-card h3
    [selector] .fgrid
    [selector] .fgrid .full
    [selector] .fl
    [selector] .fl label
    [selector] .fl input,.fl select,.fl textarea
    [selector] .fl input:focus,.fl select:focus,.fl textarea:focus
    [selector] .fl textarea
    [selector] .mfooter
    [selector] .type-meta-section
    [selector] .type-meta-section h4
    [section] /* === Tasks panel (bottom tab) === */
    [selector] .tasks-panel
    [selector] .tasks-panel-hdr
    [selector] .tasks-panel-hdr select
    [selector] .tasks-list
    [selector] .task-pill
    [selector] .task-pill:hover
    [selector] .task-pill-name
    [selector] .task-pill-status
    [selector] .task-pill-add
    [section] /* === Runtime reports / issues === */
    [selector] .issues-panel
    [selector] .report-toolbar
    [selector] .report-title
    [selector] .report-sub
    [selector] .report-actions
    [selector] .report-meta-row
    [selector] .report-list
    [selector] .report-list.compact
    [selector] .issue-card
    [selector] .report-card.is-pass
    [selector] .report-card.is-fail
    [selector] .report-card-hdr
    [selector] .report-card-sub
    [selector] .report-snippet
    [selector] .report-error
    [selector] .report-empty
    [section] /* === Steps / bottleneck table === */
    [selector] .steps-detail
    [selector] .steps-detail summary
    [selector] .steps-table
    [selector] .steps-table th
    [selector] .steps-table td
    [selector] .step-row.is-pass td:first-child
    [selector] .step-row.is-fail td
    [selector] .step-ms
    [selector] .step-bar
    [selector] .step-err
    [selector] .issue-list
    [selector] .issue-card.is-error
    [selector] .issue-card.is-warn
    [selector] .issue-title
    [selector] .issue-detail
    [section] /* === Toast === */
    [selector] #toast
    [selector] #toast.show
    [section] /* === Sidebar tabs (Library / Graph) === */
    [selector] #sidebar-tabs
    [selector] .stab
    [selector] .stab:hover
    [selector] .stab.active
    [section] /* Graph tree type label */
    [selector] .ti-type-lbl
    [section] /* === Schema preview modal === */
    [selector] .sp-card
    [selector] .sp-hdr
    [selector] .sp-hdr strong
    [selector] .sp-pre
    [selector] .sp-card .mfooter
    [section] /* === Chat modal === */
    [selector] .chat-card
    [selector] .chat-hdr
    [selector] .chat-model
    [selector] .chat-config
    [selector] .chat-config-grid
    [selector] .chat-config-grid .full
    [selector] .chat-config select[multiple]
    [selector] .chat-checks
    [selector] .chat-checks input
    [selector] .chat-actions-inline
    [selector] .chat-inline-buttons
    [selector] .chat-thread
    [selector] .chat-msg
    [selector] .chat-msg.is-user
    [selector] .chat-msg.is-assistant
    [selector] .chat-msg-meta
    [selector] .chat-msg-body
    [selector] .chat-empty
    [selector] #chat-input
    [selector] #chat-system-prompt
    [section] /* === Mobile panels === */
    [selector] #mobile-scrim
    [selector] #mobile-scrim[hidden]

structure from workflows/benchmarks/README.md:  (no extractable definitions)

structure from workflows/benchmarks/research_benchmark.json:
    [file-summary] Manifest for the live research benchmark workflow and its persisted outputs.
    [json-key] id: "research_benchmark_manifest"
    [json-key] type: "benchmark"
    [json-key] label: "research_benchmark_manifest"
    [json-key] workflow_ref: "workflows/benchmarks/research_benchmark_v1"
    [json-key] outputs_path: "workflows/benchmarks/outputs"
    [json-key] description: "Manifest for the live research benchmark workflow and its pe..."

structure from workflows/benchmarks/outputs/README.md:
    [file-summary] Benchmark Outputs
    [heading-1] # Benchmark Outputs

structure from workflows/benchmarks/outputs/bridge-runtime-check-manual-check-mojd4oy5.json:
    [json-key] benchmark_name: "bridge-runtime-check"
    [json-key] run_label: "manual-check"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "health check"
    [json-key] started_at: "2026-04-29T01:14:57.270Z"
    [json-key] completed_at: "2026-04-29T01:14:57.388Z"
    [json-key] input_payload: {topic, benchmark_name, run_label}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: null
    [json-key] model_status: null
    [json-key] run_fingerprint: null
    [json-key] logs: [0 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [0 items]
    [json-key] component_summary: [0 items]
    [json-key] runtime_output: {}
    [json-key] report: "[object Object]"
    [json-key] comparison: null
    [json-key] improvement_candidates: [5 items]

structure from workflows/benchmarks/outputs/research-benchmark-direct-fresh-1777343730183-moi0lnna.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "direct-fresh-1777343730183"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T02:35:30.183Z"
    [json-key] completed_at: "2026-04-28T02:36:27.754Z"
    [json-key] input_payload: {topic, query, started_at}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: "gemma_model"
    [json-key] model_status: {llm_endpoint, gguf_exists, models}
    [json-key] run_fingerprint: null
    [json-key] logs: [14 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [0 items]
    [json-key] component_summary: [0 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<h2></h2>
<h3>Sections</h3><ul>
  <li>Implementation Pattern..."
    [json-key] comparison: {basis, previous_run_label, previous_output_path, previous_completed_at, score_delta, +4 more}
    [json-key] improvement_candidates: [2 items]

structure from workflows/benchmarks/outputs/research-benchmark-live-gemma4-bridge-1777343817-moi0mrwo.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "live-gemma4-bridge-1777343817"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T02:36:57.1268524Z"
    [json-key] completed_at: "2026-04-28T02:37:19.934Z"
    [json-key] input_payload: {topic, query, started_at}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: "gemma_model"
    [json-key] model_status: {llm_endpoint, gguf_exists, models}
    [json-key] run_fingerprint: "5c5c39d8546783689fd7dd4fd2296941c16c50fc"
    [json-key] logs: [14 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [8 items]
    [json-key] component_summary: [8 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<h2></h2>"
    [json-key] comparison: {basis, previous_run_label, previous_output_path, previous_completed_at, score_delta, +4 more}
    [json-key] improvement_candidates: [8 items]

structure from workflows/benchmarks/outputs/research-benchmark-live-gemma4-bridge-second-1777343873-moi0p952.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "live-gemma4-bridge-second-1777343873"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T02:37:53.0188370Z"
    [json-key] completed_at: "2026-04-28T02:39:15.577Z"
    [json-key] input_payload: {topic, query, started_at}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: "gemma_model"
    [json-key] model_status: {llm_endpoint, gguf_exists, models}
    [json-key] run_fingerprint: "2b3f315fa3d61f9a8b391fc24a8e6b44c3174d9f"
    [json-key] logs: [14 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [8 items]
    [json-key] component_summary: [8 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<h2></h2>
<h3>Sections</h3><ul>
  <li>Primary Strategy</li>
..."
    [json-key] comparison: {basis, previous_run_label, previous_output_path, previous_completed_at, score_delta, +4 more}
    [json-key] improvement_candidates: [7 items]

structure from workflows/benchmarks/outputs/research-benchmark-post-migration-benchmark-2-moivtgmv.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "post-migration-benchmark-2"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T17:10:12.751Z"
    [json-key] completed_at: "2026-04-28T17:10:20.003Z"
    [json-key] input_payload: {topic, query, started_at}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: "gemma_model"
    [json-key] model_status: {llm_endpoint, gguf_exists, models}
    [json-key] run_fingerprint: "2c5ff2d9586e6fdc8d2b7f8e9758725e62ef4ea2"
    [json-key] logs: [14 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [8 items]
    [json-key] component_summary: [8 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<h2></h2>"
    [json-key] comparison: {basis, previous_run_label, previous_output_path, previous_completed_at, score_delta, +4 more}
    [json-key] improvement_candidates: [6 items]

structure from workflows/benchmarks/outputs/research-benchmark-post-migration-benchmark-final-moivtrdz.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "post-migration-benchmark-final"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T17:10:33.040Z"
    [json-key] completed_at: "2026-04-28T17:10:33.939Z"
    [json-key] input_payload: {topic, query, started_at}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: "gemma_model"
    [json-key] model_status: {llm_endpoint, gguf_exists, models}
    [json-key] run_fingerprint: "ea57889d91970883564fd0aa5760a17be3f72f6d"
    [json-key] logs: [14 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [8 items]
    [json-key] component_summary: [8 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<h2></h2>"
    [json-key] comparison: {basis, previous_run_label, previous_output_path, previous_completed_at, score_delta, +4 more}
    [json-key] improvement_candidates: [4 items]

structure from workflows/benchmarks/outputs/research-benchmark-post-migration-benchmark-moivt0s6.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "post-migration-benchmark"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T17:09:54.913Z"
    [json-key] completed_at: "2026-04-28T17:09:59.463Z"
    [json-key] input_payload: {topic, query, started_at}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: "gemma_model"
    [json-key] model_status: {llm_endpoint, gguf_exists, models}
    [json-key] run_fingerprint: "2f121a8651330d8e032fc88fd0348918893dd617"
    [json-key] logs: [14 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [8 items]
    [json-key] component_summary: [8 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<h2></h2>"
    [json-key] comparison: {basis, previous_run_label, previous_output_path, previous_completed_at, score_delta, +4 more}
    [json-key] improvement_candidates: [7 items]

structure from workflows/benchmarks/outputs/research-benchmark-speed-audit-1777390596-moish279.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "speed-audit-1777390596"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T15:36:36.6662529Z"
    [json-key] completed_at: "2026-04-28T15:36:42.579Z"
    [json-key] input_payload: {topic, query, started_at}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: "gemma_model"
    [json-key] model_status: {llm_endpoint, gguf_exists, models}
    [json-key] run_fingerprint: "052d67f8fefd1839a5e4f80eb85b9e9044dac5bf"
    [json-key] logs: [14 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [8 items]
    [json-key] component_summary: [8 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<h2></h2>
<h3>Sections</h3><ul>
  <li>Primary Strategy</li>
..."
    [json-key] comparison: {basis, previous_run_label, previous_output_path, previous_completed_at, score_delta, +4 more}
    [json-key] improvement_candidates: [7 items]

structure from workflows/benchmarks/outputs/research-benchmark-writer-check-1777343570-moi0h0e3.json:
    [json-key] benchmark_name: "research_benchmark"
    [json-key] run_label: "writer-check-1777343570"
    [json-key] workflow_id: "research_workflow"
    [json-key] topic: "LangGraph multi-agent patterns"
    [json-key] started_at: "2026-04-28T02:32:50.9777848Z"
    [json-key] completed_at: "2026-04-28T02:32:50.999Z"
    [json-key] input_payload: {topic, benchmark_name, run_label}
    [json-key] metrics: {duration_ms, report_length, report_word_count, html_detected, step_count, +7 more}
    [json-key] scorecard: {overall_score, quality_score, efficiency_score, reliability_score, classification}
    [json-key] feedback: {quality_signals, issues, notes}
    [json-key] model_id: null
    [json-key] model_status: null
    [json-key] run_fingerprint: null
    [json-key] logs: [1 items]
    [json-key] warnings: [0 items]
    [json-key] steps: [1 items]
    [json-key] component_summary: [1 items]
    [json-key] runtime_output: {report}
    [json-key] report: "<article><h2>LangGraph</h2><p>Directed graph orchestration.<..."
    [json-key] comparison: null
    [json-key] improvement_candidates: [2 items]

structure from workflows/benchmarks/research_benchmark_v1/schema.json:
    [file-summary] Port contract for benchmark workflow cell.
    [json-key] id: "research_benchmark"
    [json-key] version: 1
    [json-key] description: "Port contract for benchmark workflow cell."
    [json-key] inputs: [4 items]
    [json-key] outputs: [2 items]
    [json-key] errors: [1 items]

structure from workflows/benchmarks/research_benchmark_v1/state.js:  (no extractable definitions)

structure from workflows/benchmarks/research_benchmark_v1/workflow.json:
    [file-summary] Runs research_workflow with live local inference and persists benchmark outputs for later review.
    [json-key] id: "research_benchmark"
    [json-key] type: "benchmark"
    [json-key] version: 1
    [json-key] label: "research_benchmark"
    [json-key] path: "workflows/benchmarks/research_benchmark_v1"
    [json-key] description: "Runs research_workflow with live local inference and persist..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 1
    [json-key] entry: "research_benchmark_runner"
    [json-key] state_schema: "state.js"
    [json-key] inputs: [4 items]
    [json-key] outputs: [2 items]
    [json-key] nodes: [2 items]
    [json-key] edges: [2 items]
    [json-key] files: [3 items]
    [json-key] tests: [1 items]

structure from workflows/benchmarks/research_benchmark_v1/tests/live.json:
    [file-summary] research_benchmark live benchmark tests
    [json-key] name: "research_benchmark live benchmark tests"
    [json-key] type: "benchmark"
    [json-key] target: "research_benchmark"
    [json-key] cases: [1 items]

structure from workflows/research_workflow_v1/schema.json:
    [file-summary] Port contract for top-level research workflow cell.
    [json-key] id: "research_workflow"
    [json-key] version: 1
    [json-key] description: "Port contract for top-level research workflow cell."
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] errors: [1 items]

structure from workflows/research_workflow_v1/state.js:
    [file-summary] state.js — State schema for research_workflow_v1.
    const STEP_ORDER  «docstring: none»
    function createState(initial = {})  «docstring: none»

structure from workflows/research_workflow_v1/state.py:
    [file-summary] Python placeholder for workflow state parity. The JS runtime uses state.js. This file exists to keep the workflow's declared file list consistent and support optional Python-side tooling.
    STATE_SCHEMA = ...  «docstring: none»

structure from workflows/research_workflow_v1/workflow.json:
    [file-summary] Top-level research pipeline: search, synthesize, validate, and render a report
    [json-key] id: "research_workflow"
    [json-key] type: "workflow"
    [json-key] version: 1
    [json-key] label: "research_workflow"
    [json-key] path: "workflows/research_workflow_v1"
    [json-key] description: "Top-level research pipeline: search, synthesize, validate, a..."
    [json-key] lifecycle: "draft"
    [json-key] success_threshold: 0.8
    [json-key] entry: "search_agent"
    [json-key] state_schema: "state.js"
    [json-key] inputs: [1 items]
    [json-key] outputs: [1 items]
    [json-key] nodes: [3 items]
    [json-key] edges: [2 items]
    [json-key] files: [4 items]
    [json-key] tests: [1 items]

structure from workflows/research_workflow_v1/tests/e2e.json:
    [file-summary] research_workflow e2e tests
    [json-key] name: "research_workflow e2e tests"
    [json-key] type: "e2e"
    [json-key] target: "research_workflow"
    [json-key] cases: [1 items]

---

## Relations structure

relations from index.html:
    [asset] ui/style.css
    [asset] js/main.js

relations from chat/index.html:
    [asset] ./css/chat-lab.css
    [asset] ./js/chat-app.js

relations from chat/js/chat-app.js:
    [import] ./chat-state.js
    [import] ./chat-api.js
    [import] ./chat-render.js
    [import] ./chat-telemetry.js
    [import] ./chat-tests.js

relations from chat/js/chat-response-validator.js:
    [import] ../components/tools/chat-quality-inspector/main.js

relations from components/agents/chat-quality-inspector/test.js:
    [import] ./main.js

relations from components/inference/main.js:
    [require] fs
    [require] path
    [require] ./engines/node-llama-cpp/adapter
    [require] ./engines/llama-server-openai/adapter
    [require] ./engines/duck4i-llama/adapter
    [require] ./engines/llmjs/adapter
    [require] ./engines/webllm/adapter
    [require] ./engines/llama3pure/adapter
    [require] ./engines/hyllama/adapter

relations from components/inference/engines/duck4i-llama/adapter.js:
    [require] fs

relations from components/inference/engines/hyllama/adapter.js:
    [require] fs

relations from components/inference/tests/benchmark.js:
    [require] fs
    [require] path
    [require] ./text/run-validation-suite
    [require] ./coding/run-coding-suite
    [require] ./select-best

relations from components/inference/tests/select-best.js:
    [require] fs
    [require] path

relations from components/inference/tests/coding/run-coding-suite.js:
    [require] fs
    [require] path
    [require] util
    [require] vm
    [require] ../../main

relations from components/inference/tests/text/hello-world-conformance.js:
    [require] fs
    [require] path

relations from components/inference/tests/text/run-validation-suite.js:
    [require] fs
    [require] path
    [require] ../../main

relations from components/tools/folder-graph-scanner/main.js:
    [import] fs
    [import] path

relations from js/bridge-server.js:
    [require] http
    [require] crypto
    [require] fs
    [require] path
    [require] url
    [require] ./bridge-workspace
    [require] ../components/inference/main

relations from js/bridge-workspace.js:
    [require] crypto
    [require] fs
    [require] path

relations from js/export.js:
    [import] ./state.js
    [import] ./utils.js
    [import] ./render.js

relations from js/main.js:
    [import] ./state.js
    [import] ./render.js
    [import] ./modals.js
    [import] ./export.js
    [import] ./schema-preview.js
    [import] ./utils.js
    [import] ./bridge.js
    [import] ../components/agents/chat-quality-inspector/main.js

relations from js/modals.js:
    [import] ./types.js
    [import] ./state.js
    [import] ./utils.js
    [import] ./render.js

relations from js/render.js:
    [import] ./types.js
    [import] ./state.js
    [import] ./utils.js
    [import] ./bridge.js

relations from js/schema-preview.js:
    [import] ./bridge.js

relations from js/state.js:
    [import] ./utils.js

relations from js/utils.js:
    [import] ./types.js
    [import] ./state.js

relations from tests/inference-debug.js:
    [require] http

---

## Flow structure

flow from chat/js/chat-api.js:
    input -> state
    [input] fetchCatalog, fetchRegistry, fetchModelInfo
    [state] saveArtifact

flow from chat/js/chat-app.js:
    input -> transform -> state -> output
    [input] readConfigFromUi, loadFiles
    [transform] buildContextBlock, buildMessages
    [state] writeConfigToUi, syncSliderLabels
    [output] renderEngineOptions, render, sendMessage, exportJson

flow from chat/js/chat-render.js:
    input -> output
    [input] renderThread
    [output] renderThread

flow from chat/js/chat-response-validator.js:
    transform
    [transform] validateResponse, extractValidatedContent

flow from chat/js/chat-state.js:
    input -> state
    [input] loadState
    [state] saveState

flow from chat/js/chat-telemetry.js:
    transform
    [transform] buildArtifactBundle

flow from components/agents/chat-quality-inspector/main.js:
    transform
    [transform] _extractContent

flow from components/inference/main.js:
    input -> transform -> state
    [input] readJsonIfExists
    [transform] resolvePrunedEngineIds, normalizeContext, buildStaticCompatibilityScore, createInferenceManager
    [state] getPassingEngineSet

flow from components/inference/engines/duck4i-llama/adapter.js:
    transform
    [transform] resolvePrompt

flow from components/inference/engines/hyllama/adapter.js:
    input
    [input] readGgufHeader

flow from components/inference/engines/llama-server-openai/adapter.js:
    input -> transform -> output
    [input] createLlamaServerOpenAiEngine
    [transform] normalizeBaseUrl
    [output] createLlamaServerOpenAiEngine

flow from components/inference/engines/node-llama-cpp/adapter.js:
    input -> transform
    [input] sanitizeCompletionPayload
    [transform] normalizeBaseUrl

flow from components/inference/tests/benchmark.js:
    transform -> state
    [transform] runInferenceBenchmark
    [state] writeBenchmarkReport

flow from components/inference/tests/select-best.js:
    input -> transform
    [input] readJson
    [transform] buildCombinedCaseLeaderboard

flow from components/inference/tests/coding/run-coding-suite.js:
    input -> transform
    [input] readJson, loadCandidateFunction
    [transform] extractCode, buildPrompt, summarizeEngine, buildTimestamp

flow from components/inference/tests/text/hello-world-conformance.js:
    input
    [input] fetchWithTimeout

flow from components/inference/tests/text/run-validation-suite.js:
    input -> transform
    [input] readJson
    [transform] buildPrompt, summarizeEngine, buildTimestamp, buildCaseLeaderboardRows

flow from components/tools/benchmark_result_writer_v1/main.js:
    input -> transform -> state
    [input] shouldSkipHistoryReads, fetchJson, loadPreviousRecord
    [transform] safeJsonParse, normalizeTopicTerms, computeComponentScore, summarizeComponents
    [state] persistRecord

flow from components/tools/folder-graph-scanner/main.js:
    input -> transform
    [input] FolderGraphScanner, scan, scanFolder, scanFile
    [transform] generateId, inferIOPatterns

flow from components/tools/folder-graph-scanner/ui/main.js:
    input -> transform
    [input] initFolderScannerUI, wireScanner, showFolderScannerUI
    [transform] getNodeTypeSummary

flow from components/tools/research_benchmark_runner_v1/main.js:
    input -> transform
    [input] fetchJson, readModelStatus
    [transform] normalizeTopic

flow from js/bridge-server.js:
    input -> transform -> state
    [input] readJsonIfExists, readBody, buildInferencePayload
    [transform] getActiveInferenceManifest, resolveInferenceEngine, buildInferencePayload
    [state] getModelAssetInfo, replyCachedJson

flow from js/bridge-workspace.js:
    input -> transform -> output
    [input] readText, createMockFetch, loadRunFunction, discoverWorkspace
    [transform] parseJson, normalizePorts, normalizeStringList, normalizeRefList
    [output] renderPromptTemplate

flow from js/bridge.js:
    input -> state
    [input] fetchCachedJson, readFile
    [state] getCacheEntry, fetchCachedJson, getCachedEtag, writeFile

flow from js/export.js:
    input -> output
    [input] downloadJSON
    [output] wireExport

flow from js/main.js:
    input -> transform -> state -> output
    [input] renderChatThread, openChatModal
    [transform] summarizeNodeForChat, summarizeRuntimeReport, buildChatPrompt, buildConstrainedPrompt
    [state] setupSplitter, setupLayoutSplitters, syncMobileScrim, chatPresetText
    [output] renderGlobalControls, renderChatConfigurator, renderChatThread, sendChatMessage

flow from js/modals.js:
    input -> state
    [input] openNodeModal, openEdgeModal
    [state] updateNodeModalExtra

flow from js/render.js:
    input -> transform -> state -> output
    [input] isTreeOpen, loadTasksForPanel, openFile
    [transform] resolveTasksUrl, buildScopeCrumbs, buildFileSymbolEntries, buildComponentFileTree
    [state] setSidebarTab, setupDragEvents, setScope, syncEditorHighlight
    [output] requestCanvasRender, renderLibraryEntry, renderSidebarNode, renderLibrarySidebar

flow from js/schema-preview.js:
    input
    [input] openSchemaPreview, _downloadText

flow from js/state.js:
    input -> transform -> state
    [input] readPersistedState, loadState
    [transform] buildCrumbs
    [state] readPersistedState, saveState, setBridgeStatus

flow from js/utils.js:
    input -> transform
    [input] loadFileContent
    [transform] parsePorts

flow from tests/inference-quality-test.js:
    transform
    [transform] extractMathAnswer, runInferenceTest

---

## API endpoints

cli entry points:
    [cli] components/tools/folder-graph-scanner/main.js — process.argv CLI

core surface candidates for API/MCP exposure:
    [candidate] js/render.js: requestCanvasRender, wireCanvasInteractions, getTasksIntegrationConfig, resolveTasksUrl, setSidebarTab (+3 more)
    [candidate] js/state.js: createRootNode, createEmptyGraph, createDefaultChatState, cloneGraph, readPersistedState (+3 more)
    [candidate] js/main.js: renderGlobalControls, applyLayoutStyles, setupSplitter, setupLayoutSplitters, syncMobileScrim (+3 more)
    [candidate] chat/js/chat-app.js: sanitizeBackend, renderEngineOptions, toast, readConfigFromUi, writeConfigToUi (+3 more)
    [candidate] js/utils.js: esc, ct, uid, childrenOf, structuredCloneSafe (+3 more)
    [candidate] components/tools/benchmark_result_writer_v1/main.js: bridgeBase, slugify, toDurationMs, round, clamp (+3 more)

automation suggestions:
    [suggest-mcp] wrap core functions with MCP SDK tool decorators for agent integration
    [suggest-contract] add an OpenAPI/JSON schema to document the API surface

api from js/bridge-server.js:
    [route] GET /api/file
    [route] GET /api/list
    [route] GET /api/model
    [route] GET /api/registry
    [route] GET /api/runtime/run
    [route] GET /api/runtime/test
    [route] GET /api/llm/complete

---
*231 files indexed · generated by extract_project_spec.py*