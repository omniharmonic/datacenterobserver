---
title: What is an AI data center?
order: 1
summary: A 5-minute primer on scale, energy, water, and land use — and why these facilities are different from the data centers of a decade ago.
---

## They are buildings, but they look more like power plants.

A modern AI data center is a warehouse-sized structure packed with tens of thousands of GPUs (specialized chips for training large AI models). The buildings themselves are unremarkable — concrete tilt-up walls, no windows. What's remarkable is the supporting infrastructure: substations, transformer yards, cooling towers, water lines, generators, fiber trunks, and security fencing.

A "hyperscale" campus is typically **100–2,000 acres**, draws **100–2,000 megawatts** of electricity, and consumes **millions of gallons of water per day** for cooling.

## What is a megawatt, in practical terms?

| Load | Roughly equivalent to |
|------|----------------------|
| 1 MW | ~750 average US homes |
| 100 MW | A small town |
| 1,000 MW (1 GW) | The output of a typical nuclear reactor |

The largest AI campuses now under construction will draw **1–2 GW each** — meaning a single project can consume more power than the city it's built near. Multiply that across a state, and grid capacity becomes the binding constraint on the whole regional economy.

## Why now?

Three forces stacked on top of each other:

1. **The model-scale arms race.** Training a frontier AI model in 2026 requires ~100x the compute of 2022, and that ratio is still climbing.
2. **GPU supply chain capacity.** NVIDIA's annual data-center revenue went from ~$15B (2022) to over $100B (2024) — and every chip shipped goes into a rack somewhere.
3. **Capital availability.** Sovereign-wealth funds, PE firms, and corporate hyperscalers have effectively unlimited balance sheets for this buildout, and they're willing to deploy faster than utilities, regulators, and communities can absorb.

## What's distinctive about *AI* data centers?

Traditional cloud data centers serve many small workloads (web apps, email, video streaming). They're optimized for **availability** — redundant power, distributed across regions, modest density.

AI data centers are optimized for **density** — pack as much compute as physically possible into the smallest footprint, because GPUs benefit from being close together when training a single model. This means:

- **Higher power density per rack** (40–120 kW vs. ~5–10 kW for traditional cloud)
- **Liquid cooling** is increasingly required (water + closed loops; sometimes immersion in dielectric fluid)
- **Bigger transformer yards** — a single hyperscale AI campus needs the same electrical infrastructure as a small city
- **Less geographic flexibility** — a single AI training run can't easily span multiple regions, so operators concentrate capacity where land, power, and tax incentives align

## What it means for communities

Communities now hosting major AI buildouts report the same set of impacts:

- **Grid strain.** Local utilities petition state regulators to fast-track new generation — often natural gas, sometimes nuclear, occasionally renewables. Costs are typically socialized to residential ratepayers.
- **Water consumption.** Evaporative cooling can require 1–5 million gallons per day per campus. In dry regions, this competes with agriculture and municipal supply.
- **Noise.** Cooling towers and backup generators run constantly. Residents within a half-mile commonly report sleep disruption.
- **Tax abatement.** Sites are almost always offered substantial property-tax breaks. The promised job count rarely materializes at scale — hyperscale buildings are mostly automated.

None of this is automatically bad — but it's also rarely subject to the level of public process that a comparable industrial facility would face. That asymmetry is what this project exists to address.
