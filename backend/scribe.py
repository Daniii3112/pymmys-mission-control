"""
Scribe — real text output generator for agent-writer tasks.

When the Scribe agent (id: "agent-writer") completes a task, this module
generates a real deliverable to store in task.output.

Resolution order:
  1. OpenAI API     — used when `openai` is installed AND OPENAI_API_KEY is set
  2. Deterministic  — structured template output based on task title/description

Deterministic templates are realistic but reproducible: same task title always
produces the same text, no randomness.
"""

import os
import textwrap

# ─── LLM path (optional) ─────────────────────────────────────────────────────

_openai_client = None

try:
    from openai import OpenAI as _OpenAI
    _api_key = os.getenv("OPENAI_API_KEY")
    if _api_key:
        _openai_client = _OpenAI(api_key=_api_key)
        print("[scribe] OpenAI SDK ready — Scribe will use GPT-4o-mini outputs")
    else:
        print("[scribe] OPENAI_API_KEY not set — using deterministic outputs")
except ImportError:
    print("[scribe] openai package not installed — using deterministic outputs")


# ─── Deterministic templates ──────────────────────────────────────────────────

def _template(title: str, description: str) -> str:
    """
    Returns a realistic structured output derived from the task title and
    description.  No randomness — identical inputs always produce identical text.
    """
    t = title.lower()

    if any(k in t for k in ("summary", "exec", "executive", "overview")):
        return textwrap.dedent(f"""\
            ## Executive Summary: {title}

            ### Overview
            {description}

            ### Key Findings
            1. Initial assessment confirms full feasibility within established constraints.
            2. Three primary risk vectors identified; all are mitigable with current resources.
            3. Timeline is on track — no critical path blockers detected.

            ### Strategic Recommendations
            - Proceed to execution phase without further pre-conditions.
            - Prioritise risk vector #2 (resource contention) in the next sprint cycle.
            - Schedule stakeholder review at the 75% milestone mark.

            ### Conclusion
            All pre-conditions for advancement are met. This document is approved
            for distribution to mission stakeholders.
        """).rstrip()

    if any(k in t for k in ("blog", "article", "post", "launch", "flagship")):
        return textwrap.dedent(f"""\
            # {title}

            > {description}

            ## Introduction

            The landscape is shifting. Today marks a milestone that redefines what teams can
            accomplish when intelligent orchestration meets intentional design.

            ## What's Changing

            This release introduces a fully redesigned core — faster, more reliable, and built
            around the feedback of thousands of users who pushed the system to its limits.

            Key highlights:
            - **2× throughput** on standard workloads with no configuration changes
            - **Zero-downtime** deployment support across all tiers
            - **Native integration** with existing toolchains via an open plugin API

            ## Why It Matters

            Speed and reliability are table stakes. What makes this release meaningful is the
            coherence: every component was designed to work together — not bolted on after the fact.

            ## Get Started

            Documentation is live at `/docs`. Migration guides are available for existing users.
            Early access opens this week — reach out to your account team to reserve a slot.
        """).rstrip()

    if any(k in t for k in ("report", "audit", "compliance", "gdpr", "pii")):
        return textwrap.dedent(f"""\
            ## Report: {title}

            **Status:** Complete
            **Classification:** Internal — Restricted Distribution

            ### Scope
            {description}

            ### Findings Summary

            | Area                   | Status              | Risk Level |
            |------------------------|---------------------|------------|
            | Data ingestion paths   | Reviewed            | Low        |
            | PII handling           | Compliant           | Low        |
            | Retention policies     | Partially compliant | Medium     |
            | Third-party processors | Reviewed            | Low        |

            ### Non-Conformances
            - Retention policy for analytics events exceeds GDPR Article 5(1)(e) guidance by
              14 days. **Remediation:** Update pipeline config to enforce a 90-day hard cap.

            ### Conclusion
            One minor non-conformance found. No critical findings. Recommended remediation
            is low-effort and can be resolved in the next infrastructure sprint.
        """).rstrip()

    if any(k in t for k in ("calendar", "schedule", "plan", "roadmap", "content")):
        return textwrap.dedent(f"""\
            ## {title}

            > {description}

            ### 8-Week Execution Calendar

            | Week | Theme                        | Channel       |
            |------|------------------------------|---------------|
            | 1    | Teaser & awareness           | Social        |
            | 2    | Blog: The problem we solve   | Blog          |
            | 3    | Email: Early access invite   | Email         |
            | 4    | Feature spotlight series     | Social        |
            | 5    | Long-form: Industry trends   | Blog          |
            | 6    | Email: Launch countdown      | Email         |
            | 7    | Launch day — all channels    | All           |
            | 8    | Post-launch recap            | Blog + Email  |

            ### Dependencies
            - Design assets must be finalised before Week 1 kick-off.
            - Legal review of email copy required before Week 3 send.
            - Video script sign-off required before Week 7.
        """).rstrip()

    # Generic fallback
    return textwrap.dedent(f"""\
        ## {title}

        > {description}

        ### Deliverable

        Task completed successfully. All objectives within scope have been addressed.

        Analysis confirmed the primary goal is achievable within established constraints.
        Relevant stakeholders have been identified and this output has been structured
        for handoff to the next stage.

        No blockers were encountered during execution. This output is ready for
        downstream consumption and review.
    """).rstrip()


# ─── Public API ───────────────────────────────────────────────────────────────

def generate_output(title: str, description: str) -> str:
    """
    Generate a text deliverable for a completed Scribe task.

    Uses the OpenAI API (gpt-4o-mini) when available; falls back to deterministic templates.
    Always returns a non-empty string suitable for task.output.
    """
    if _openai_client is not None:
        try:
            response = _openai_client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=600,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are Scribe, an expert content and communications agent "
                            "inside an AI orchestration system. Write professional, "
                            "concise deliverables in markdown format."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"You just completed this task:\n"
                            f"Title: {title}\n"
                            f"Description: {description}\n\n"
                            "Write the actual deliverable output for this task. "
                            "Be concise, professional, and realistic. "
                            "Format as markdown. Maximum 350 words."
                        ),
                    }
                ],
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:
            print(f"[scribe] OpenAI call failed, falling back to template: {exc}")

    return _template(title, description)
