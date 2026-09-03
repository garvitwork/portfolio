# Reverse-Engineering the Negation Circuit in GPT-2 Small

**Garvit** · [GitHub repo](https://github.com/garvitwork/REVERSE_ENGINEERING_GPT2)

## Abstract

GPT-2 small reliably shifts its sentiment predictions when a sentence is
negated (e.g. "the film was really **good**" → "did not think the film was
really **bad**"). Using activation patching and direct logit attribution
— two independent causal methods — I identify a small set of attention
heads that mediate this shift, with head **L10H9** standing out as the
single strongest signal in both methods independently. Ablation studies
show the effect is **distributed and redundant**: removing L10H9 alone
barely changes behavior (~1% drop), but removing the top 10 implicated
heads together removes 37% of the effect, revealing backup redundancy
similar to what's been reported in other GPT-2 circuits (e.g. the IOI
circuit, Wang et al. 2022).

## Research question

Which attention heads and MLP layers in GPT-2 small causally mediate
negation's effect on sentiment prediction, and does the effect localize
to one component or spread across several?

## Method

**Dataset.** 960 templated minimal-pair prompts (`data/train.jsonl`,
`data/test.jsonl`, 70/30 split), each ending right before a single-token
adjective, e.g.:
- Affirmative: *"The critic said the film was truly ___"* → expects `wonderful`
- Negated: *"The critic did not say the film was truly ___"* → expects `horrible`

Metric: `logit_diff = logit(positive_adj) − logit(negative_adj)` at the
final token position — a clean, single-number readout of the model's
sentiment prediction.

**Baseline.** Confirmed the effect is real before doing any interpretability
work: mean logit_diff = **0.900** on negated prompts vs. a clearly higher
value on affirmative prompts (behavior is robust, not noise).

**Activation patching.** For each of GPT-2 small's 144 attention heads
(12 layers × 12 heads) and 12 MLP layers, patched the clean (affirmative)
activation into the corrupted (negated) run and measured how much of the
logit_diff was recovered.

**Direct logit attribution (independent check).** Decomposed the final
logit_diff additively across every head via the residual stream, without
any patching — a second, unrelated method to cross-validate the first.

**Ablation.** Zero-ablated the implicated heads and measured the drop in
logit_diff, to move from correlational to causal evidence.

## Results

**Top heads agree across both methods:**

| Head | Patching recovery | Direct logit attribution |
|---|---|---|
| L10H9 | **0.551** (highest) | **−2.93** (highest magnitude) |
| L9H10 | 0.257 | −1.64 |
| L8H5 | 0.286 | — |
| L9H3 | 0.246 | — |

L10H9 being the top result in *both* an activation-based method and a
purely additive attribution method — computed completely differently — is
strong evidence it's a real, not spurious, finding.

**Ablation confirms redundancy, not single-point-of-failure:**

| Ablated | Logit_diff (baseline 0.900) | Drop |
|---|---|---|
| L10H9 alone | 0.895 | ~1% |
| L10H9, L8H5, L9H3 | 0.833 | ~7% |
| Top 10 heads by \|DLA\| | **0.565** | **37%** |

No single head is necessary for the behavior — removing one gets
compensated by others. This "backup head" phenomenon has been documented
before in GPT-2 circuits (e.g. the IOI paper's backup name-mover heads),
and this project independently reproduces the same pattern for a
different behavior (negation, not indirect object identification).

## Limitations

- 37% recovery from the top 10 heads means the remaining ~63% of the
  effect is spread across more components — likely including MLP layers
  8 and 9, which showed large patching scores (+0.69 and −0.80
  respectively) but were not included in the ablation set.
- Dataset uses templated sentences; while a held-out test split and
  hand-written stress examples (different negation word, different
  template) were built into the pipeline, full generalization testing
  across negation types ("never" vs "did not" vs "hardly") was not
  exhaustively run.
- Findings are specific to GPT-2 small (124M params); whether the same
  circuit exists in larger models is untested.

## Related work

- Wang et al., *Interpretability in the Wild: a Circuit for Indirect
  Object Identification in GPT-2 small* (2022) — source of the
  activation patching + direct logit attribution methodology used here,
  and the origin of the "backup head" concept this project reproduces
  for a different behavior.
- Anthropic, *In-context Learning and Induction Heads* (2022).

## Reproducing this

Full code, dataset, and notebook: [GitHub repo](https://github.com/garvitwork/REVERSE_ENGINEERING_GPT2).
Run `negation_circuit.ipynb` in Google Colab (free T4 GPU).

---

### How to talk about this in an interview (short version)

*"I picked one specific model behavior — how GPT-2 flips sentiment under
negation — and reverse-engineered which internal components cause it,
using two independent causal methods that agreed with each other. Ablation
then showed the effect isn't localized to one head — it's a distributed,
redundant circuit, which mirrors a known phenomenon in other GPT-2
circuits. I can walk through the exact experiment design and what each
method controls for."*

That's a mechanism story, not a demo — it's what separates this from most
portfolio projects.
