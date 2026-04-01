# Journi Final Implementation Plan

## Goal

Build one polished, impressive, fully implementable version of `Journi` for the VibeCon selection round.

This is not a long-term startup roadmap.

This is a hackathon-grade product plan designed to show:

- strong product thinking
- strong UI taste
- strong implementation judgment
- ability to ship a coherent experience

The plan below intentionally cuts anything that increases risk without improving the demo.

## Product Definition

`Journi` is a visual trip planner for India.

The user does not chat with it.
The user does not get a giant itinerary dump.
The user does not fill out a giant travel form.

Instead:

1. they enter a few trip basics
2. they see a small set of good option blocks
3. they keep selecting what they like
4. their trip forms live on the right side
5. they can click any chosen block and swap it

## Core Promise

Plan your trip, one choice at a time.

## Final Product Positioning

`Journi` helps people plan a real India trip through a visual block flow.

It turns messy travel research into:

- a guided decision process
- a live trip canvas
- a clear budget
- a coherent final plan

## The Single Best Version To Build

For the selection round, the best version is:

### `Known destination, short leisure trip, India only`

This means:

- user already knows the destination
- trip length is roughly 3 to 7 days
- source city is in India
- destination is in India
- product focuses on leisure trips, not every travel use case

This is the most implementable version that can still feel premium and impressive.

## What We Are Explicitly Not Building

- no generic AI trip planner
- no chat-first experience
- no full search engine across the entire internet
- no booking engine
- no live booking guarantees
- no full OTA competitor
- no global support
- no heavy group planning
- no visa/document workflow
- no full train/bus aggregation layer
- no overengineered fallback system in v1

## Why This Narrow Scope Is Correct

The selection round cares more about:

- clarity
- polish
- confidence
- taste
- execution

than feature breadth.

A narrow version that feels finished is much stronger than a broad version that feels half-real.

## Final User Experience

The user experience should feel like:

- easy
- visual
- calm
- guided
- satisfying

The user should feel:

- I only need to answer a few things
- the app is helping me decide
- I can see my trip forming
- I can compare without chaos
- this is actually usable

The original UX vision should remain intact:

- enter a few basics
- keep selecting the options you like
- watch the trip form on the right
- change any earlier block if needed
- see famous places and activities appear automatically
- feel guided without feeling restricted

## Core Interaction

The block UI is the heart of the product.

The user should feel like they are:

- selecting between good options
- watching the trip form instantly
- adjusting earlier choices easily
- moving forward without friction

The product should feel like a trip is assembling itself in front of them.

## Golden Demo Flow

This is the exact flow the product should do extremely well:

1. User enters:
   - source city
   - destination
   - start date
   - number of days
   - budget
   - number of travelers
   - trip style

2. `Journi` shows destination summary and trip setup confirmation.

3. `Journi` automatically loads famous places and lightweight activity suggestions for that destination.

4. `Journi` shows outbound travel blocks.

5. User selects one outbound option.

6. `Journi` updates the right-side trip canvas.

7. `Journi` shows stay blocks.

8. User selects one stay option.

9. `Journi` shows local transfer / movement guidance.

10. `Journi` shows activity/day-shape blocks using the destination context and famous places already loaded.

11. `Journi` shows return travel blocks.

12. User finishes with:
   - full trip timeline
   - total budget
   - chosen travel and stay
   - final summary

## Final V1 Scope

### Must include

- India-only trip planning
- known destination flow
- source city input
- start date
- approximate number of days
- budget
- traveler count
- trip style
- destination summary
- automatic famous places section
- outbound travel option blocks
- stay option blocks
- local transfer estimate block
- return travel option blocks
- auto-loaded activity/day-shape suggestions
- right-side live trip canvas
- live budget updates
- live timing updates
- editable chosen blocks
- final shareable trip summary page

### Nice to have only if time remains

- save and resume
- manually pasted booking links
- simple destination suggestion mode

### Out of scope for the selection build

- trains as a core feature
- buses as a core feature
- already-booked import as a core feature
- niche-query browsing fallback
- account systems beyond a minimal approach
- social / collaborative trip planning
- weather awareness
- crowd intelligence
- route graph mode

## Hard Product Decisions

These decisions are now locked.

### 1. Destination is known in v1

The user picks or enters the destination upfront.

This avoids turning the app into a discovery engine before the planner even starts.

### 2. Flights are the primary transport layer

Flights are the main real transport option source in v1.

Why:

- free data is more available
- the UX can feel real
- it is enough to demonstrate the planning concept

### 3. Local movement is estimation-driven

Use mapping/routing tools for:

- airport transfer estimates
- city travel timing
- rough local movement guidance

This is enough for a strong demo.

### 4. Stays are allowed to be narrower than transport

Stays do not need to be internet-perfect.

They need to be:

- believable
- visually comparable
- coherent with budget and location

### 5. The magic is in the planner, not source coverage

The thing judges should remember is not:

- wow, they connected many travel sites

It should be:

- wow, this planning experience is really well thought out

## Source Strategy

The source layer should stay simple and free-first.

## Free-first stack

### Flights

Use `Travelpayouts Data API`.

Treat it as:

- route suggestion data
- planning candidate data
- pricing guidance

Do not treat it as guaranteed real-time booking truth.

### Geocoding

Use `Nominatim`.

This can power:

- city lookup
- destination lookup
- location normalization

### Routing / transfer estimation

Use `openrouteservice` or `OSRM`.

This can power:

- airport/station transfer timing
- distance estimates
- local movement suggestions

### Destination and activity content

Use:

- `OpenTripMap`
- `Wikivoyage`

This can power:

- destination summary
- famous places that appear automatically
- must-visit spots
- things to do
- day-shape suggestions
- attraction density

### Stays

For the selection build, pick one of these and lock it:

1. one limited stay source
2. pre-normalized stay candidates for selected destinations
3. user-pasted stay links if needed

The safest option for a strong demo is:

### `pre-normalized stay candidates for selected destinations`

That gives you:

- stable UI
- consistent comparisons
- lower risk
- better control over the demo experience

## Final Recommendation On Data

For the selection build, do this:

- real API-backed flight options
- real mapping-backed transfer estimates
- real open-content destination/activity data
- controlled stay data

That balance gives you:

- enough reality
- much lower implementation risk
- a better chance of a polished outcome

## Final Transport Scope

### In v1

- flights
- local transfer estimates
- return travel via flights

### Not core in v1

- trains
- buses
- metro chains
- autos as a separate live data source

Those can still appear as simple guidance text or estimation, but not as full source-driven planning blocks.

## Final Stay Scope

Stay blocks should show:

- property name
- area or locality
- estimated price per night
- total stay cost
- short reason to choose it
- tags like:
  - best value
  - close to activity area
  - budget friendly
  - more comfortable

Stay data does not need to be perfect.
It needs to feel coherent and useful.

## Final Activity Scope

Activity blocks should be light.

They are not the core of the product.

Their purpose is to make the trip feel complete.

Good activity outputs:

- famous places near the destination
- relaxed trip shape
- explore-heavy day
- beach day
- food-focused day
- sightseeing day

This is enough.

These should appear automatically after destination selection without forcing the user to search for them manually.

Each place or activity block can show:

- name
- short description
- rough time needed
- rough spend
- simple tag like `must visit` or `popular`

## Option Block Design

Every option block should be easy to scan.

Suggested block contents:

- title
- duration or timing
- price
- key tag
- one-line explanation

Example labels:

- Cheapest
- Fastest
- Best value
- Smoothest
- Better for weekend trip
- Good fit for your budget

## Right-Side Trip Canvas

This is the visual payoff.

The right side should always show:

- chosen outbound travel block
- chosen stay block
- local transfer block
- optional activity blocks
- chosen return block
- trip timeline
- total budget
- per-person estimate

The user should feel constant progress.

## Editing Behavior

Editing earlier choices must be simple.

If the user clicks a selected block:

- reopen the alternatives for that step
- let them swap the block
- instantly update timing and budget

This interaction is one of the most impressive parts of the product.

## Internal Decision Logic

The internal engine can reason about:

- cost
- speed
- comfort
- budget fit
- timing fit
- number of travel days
- trip style

But the user should never feel this complexity.

The interface should only show:

- clear recommendations
- simple labels
- short explanations

## Product Principle

Complexity in the engine, simplicity in the interface.

## Design Direction

The product should not look like an AI dashboard.

Avoid:

- black-heavy dark interfaces
- neon purple AI styling
- futuristic control-panel aesthetics

The product should feel:

- natural
- warm
- calm
- premium
- consumer-friendly
- trustworthy

## Visual Mood

Use:

- light backgrounds
- soft greens
- muted sand tones
- sky blues
- generous spacing
- rounded cards
- low-stress visual density

The feeling should be:

`This makes trip planning feel easy.`

not:

`This is another AI tool.`

## UX Principles

### Consumer-first

Anyone should understand it quickly.

### Calm over flashy

Trip planning is already stressful. The product should reduce stress.

### One decision at a time

Do not overload the screen.

### Plain language

Do not use technical system language.

### Strong trust

Users should feel the app is careful and helpful.

## Final Screen List

### 1. Landing page

Purpose:

- explain the product clearly
- communicate the block-based planning experience
- get user into the planner quickly

### 2. Planner setup screen

Inputs:

- source city
- destination
- start date
- number of days
- budget
- travelers
- trip style

### 3. Main planner screen

Left:

- current decision step
- option blocks

Right:

- live trip canvas
- budget
- timeline

### 4. Final trip summary screen

Show:

- chosen blocks
- final trip timeline
- budget summary
- trip overview
- shareable plan

## Exact Launch Flow To Build

If there is only time to make one flow excellent, build this:

1. Bangalore -> Goa
2. 4-day trip
3. 2 travelers
4. mid-range budget
5. choose flight
6. choose stay
7. see transfer estimate
8. choose return
9. see final trip summary

Then make the system reusable for similar routes.

This gives you one extremely strong demo and enough flexibility to show it is not hardcoded.

## What Makes The Demo Feel Amazing

The amazing feeling should come from:

- how fast the planner responds
- how clean the option blocks look
- how the trip forms visually
- how smoothly the budget updates
- how easy it is to edit earlier choices
- how naturally famous places and activities appear

Not from:

- too many APIs
- too many providers
- too many features

## Technical Implementation Standard

For this build, "fool-proof" means:

- every visible feature works
- the main flow is stable
- source dependencies are limited
- no fake-feeling broken branches
- no dead buttons
- no overpromised coverage

## What To Do If Data Is Weak

If some data category is weak:

- simplify it
- constrain it
- pre-normalize it
- present it clearly

Do not add complexity just to appear comprehensive.

## Final Success Criteria

The build is successful if a judge can:

1. open the app
2. understand it immediately
3. enter a trip in seconds
4. choose through the blocks naturally
5. watch the trip form on the right
6. feel that the product is polished and smart
7. believe you can actually build products

## Final Summary

`Journi` for VibeCon round 1 should be:

- India only
- known destination
- flights first
- visually block-based
- budget-aware
- timing-aware
- easy to edit
- calm and premium in design
- narrow enough to be truly buildable

This is the strongest version because it is:

- implementable
- coherent
- demoable
- memorable
- polished

Most importantly, it shows taste and execution instead of overreach.

## Build Plan

This section translates the product plan into a practical implementation sequence.

The goal is to build one polished, demo-ready version without losing time on broad infrastructure.

## Checklist Legend

Use this while building:

- `[ ]` not started
- `[x]` done

## Build Principles

- build the golden path first
- make visible features work before adding more data depth
- prefer stability over coverage
- keep the UX polished at every stage
- do not add clever backend systems unless they directly improve the demo

## Build Order

The build should happen in this order:

1. app shell and visual system
2. planner setup flow
3. main block planner UI
4. right-side trip canvas state
5. flight option generation
6. stay option generation
7. local transfer estimates
8. famous places and activity blocks
9. final summary screen
10. polish and demo hardening

## Phase 1: App Foundation

### Objective

Set up the project so UI work can move fast and consistently.

### Deliverables

- [ ] Next.js app scaffold
- [ ] routing structure
- [ ] global layout
- [ ] typography system
- [ ] color palette
- [ ] reusable card/button/input components
- [ ] base page container and spacing system

### Done when

- landing page and planner pages can share a consistent design system
- visual style already feels calm and premium

## Phase 2: Planner Setup Screen

### Objective

Build the first screen where users enter trip basics quickly and clearly.

### Inputs

- source city
- destination
- start date
- number of days
- budget
- travelers
- trip style

### Deliverables

- [ ] setup form
- [ ] lightweight validation
- [ ] clean empty states
- [ ] continue CTA into planner

### Done when

- a user can complete setup in under 30 seconds
- the screen already feels consumer-grade

## Phase 3: Planner State Model

### Objective

Create the internal state model that powers the whole block planner.

### Required state

- [ ] trip basics
- [ ] selected outbound option
- [ ] selected stay option
- [ ] selected transfer option
- [ ] selected activity blocks
- [ ] selected return option
- [ ] total budget
- [ ] total travel time
- [ ] timeline summary

### Done when

- one state object can fully render the right-side trip canvas
- changing one block updates dependent totals cleanly

## Phase 4: Main Planner UI

### Objective

Build the left/right split experience.

### Left side

- [ ] current step header
- [ ] option cards
- [ ] short recommendation labels
- [ ] one-click selection

### Right side

- [ ] trip canvas stack
- [ ] selected blocks in order
- [ ] running budget
- [ ] timing summary
- [ ] per-person estimate

### Done when

- selecting any block instantly updates the trip canvas
- the interaction already feels satisfying

## Phase 5: Flight Data Layer

### Objective

Make outbound and return travel feel real.

### Source

- `Travelpayouts Data API`

### What to build

- [ ] request helper
- [ ] normalization layer
- [ ] transform source data into `Journi` flight blocks
- [ ] rank by simple internal scoring

### Each flight block should show

- [ ] carrier or route label
- [ ] departure/arrival timing
- [ ] duration
- [ ] price
- [ ] one clear label like `Fastest` or `Best value`
- [ ] one short reason

### Done when

- the planner can reliably show outbound and return flight options
- the data looks clean and usable in cards

## Phase 6: Stay Blocks

### Objective

Make stay selection stable and demo-safe.

### Recommended implementation

Use pre-normalized stay candidates for selected destinations.

### What to build

- [ ] destination-to-stay dataset
- [ ] stay card UI
- [ ] selection logic
- [ ] stay cost aggregation based on trip length

### Each stay block should show

- [ ] property name
- [ ] area
- [ ] cost per night
- [ ] total cost
- [ ] short reason
- [ ] simple tag

### Done when

- stay blocks feel coherent with trip budget and destination
- the stay layer never feels brittle in the demo

## Phase 7: Transfer Estimates

### Objective

Add realistic local movement guidance.

### Sources

- `Nominatim`
- `openrouteservice` or `OSRM`

### What to build

- [ ] source/destination geocoding helpers
- [ ] airport or location transfer estimation
- [ ] simple transfer block generation

### Transfer block should show

- [ ] from/to context
- [ ] estimated duration
- [ ] estimated cost range
- [ ] short explanation

### Done when

- chosen flights can produce believable local transfer guidance
- timings and costs update the trip summary

## Phase 8: Destination Summary And Activities

### Objective

Make the destination feel alive without building a heavy itinerary engine.

### Sources

- `OpenTripMap`
- `Wikivoyage`

### What to build

- [ ] destination summary fetcher
- [ ] famous places list
- [ ] simple activity/day-shape generator
- [ ] optional activity block selection

### Activity block examples

- [ ] beach day
- [ ] food-focused day
- [ ] sightseeing day
- [ ] relaxed explore day

### Done when

- famous places appear automatically after destination selection
- activity blocks feel relevant and lightweight

## Phase 9: Editing And Swap Logic

### Objective

Preserve the core magic of the product.

### What to build

- [ ] click selected block
- [ ] reopen alternatives for that step
- [ ] replace choice
- [ ] recalculate totals and timeline

### Done when

- swapping an earlier decision feels instant and safe
- the trip canvas stays coherent after edits

## Phase 10: Final Summary Screen

### Objective

End the planner with a clean, shareable payoff.

### Should show

- [ ] destination
- [ ] dates
- [ ] chosen outbound block
- [ ] chosen stay block
- [ ] chosen activities
- [ ] chosen return block
- [ ] transfer estimate
- [ ] total cost
- [ ] per-person cost
- [ ] trip timeline

### Done when

- the final screen feels polished enough to demo on its own
- the output looks like something a user would actually share

## Phase 11: Polish

### Objective

Make the app feel premium and complete.

### Focus areas

- [ ] loading states
- [ ] smooth transitions
- [ ] empty states
- [ ] no dead buttons
- [ ] cleaner copy
- [ ] consistent spacing
- [ ] mobile-safe layout
- [ ] share page polish

### Done when

- the app feels intentional, not hacked together

## Final Technical Stack

### Frontend

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`

### Data / APIs

- `Travelpayouts`
- `Nominatim`
- `openrouteservice` or `OSRM`
- `OpenTripMap`
- `Wikivoyage`

### Hosting

- `Vercel`

## Recommended Folder Shape

- `app/`
- `components/`
- `lib/`
- `lib/api/`
- `lib/planner/`
- `lib/mock/`
- `types/`

## Internal Modules To Build

### UI modules

- planner form
- option card
- trip canvas
- summary card
- destination summary panel

### Logic modules

- planner state manager
- budget calculator
- timing calculator
- block ranking helper
- option normalization helpers

### Source modules

- flights client
- places client
- routing client
- destination content client

## Build Priorities

### Priority 1

- [ ] setup screen
- [ ] main planner shell
- [ ] trip canvas
- [ ] flight blocks

### Priority 2

- [ ] stay blocks
- [ ] transfer estimates
- [ ] budget and timing calculations

### Priority 3

- [ ] famous places
- [ ] activity blocks
- [ ] final summary page

### Priority 4

- [ ] edit/swap refinement
- [ ] visual polish
- [ ] demo hardening

## Demo-First Rule

At every point, ask:

`Does this improve the main demo flow?`

If not, defer it.

## Core Demo Scenario

The first flow to optimize should be:

- [ ] Bangalore to Goa
- [ ] 4 days
- [ ] 2 travelers
- [ ] mid-range budget
- [ ] select outbound flight
- [ ] select stay
- [ ] see transfer estimate
- [ ] add one or two activity blocks
- [ ] select return flight
- [ ] view final summary

Only after this flow feels excellent should broader reuse be added.

## Acceptance Criteria

The build is ready when:

- [ ] a new user understands the product quickly
- [ ] setup takes less than 30 seconds
- [ ] option cards load in a believable way
- [ ] selecting blocks feels instant
- [ ] budget and time update correctly
- [ ] famous places appear automatically
- [ ] activities can be added simply
- [ ] editing earlier choices works
- [ ] final summary looks clean and shareable
- [ ] nothing important feels broken or fake

## Risk Management

If something becomes unstable:

- reduce data coverage
- use more controlled data
- simplify the step
- keep the UX intact

Never sacrifice the planner experience just to keep an ambitious backend feature.

## Final Build Mindset

The win condition is not:

- the most data sources
- the most providers
- the most modes of transport

The win condition is:

- one trip planning flow that feels beautiful, smart, and real

That is the version most likely to impress in the selection round.
# Journi Implementation Plan

## Product Name

`Journi`

## Core Idea

`Journi` is a visual, block-based trip planning product for India-first travel.

The product is not an AI trip chatbot and not a booking-site clone. The core experience is:

- users start with whatever they already know
- the app asks how planned they already are
- the app proposes the next best trip options as blocks
- users select one option at a time
- the full trip forms live on the right side
- any chosen block can be edited later by reopening the alternatives shown at that step

The main value is turning chaotic trip planning across many websites into one guided, visual decision flow.

## One-Line Positioning

Plan your trip, one choice at a time.

## Better Product Framing

`Journi` helps people build a real trip from home to destination and back, step by step, while comparing travel, stay, timing, and budget choices in one place.

## What This Is Not

- not a generic AI trip planner
- not a chat-with-travel-data product
- not a booking engine
- not a scraper for every travel website on earth
- not a giant all-in-one OTA

## Why This Idea Is Strong

- real consumer pain
- obvious utility
- strong visual UI opportunity
- different from an LLM wrapper
- users can begin with incomplete information
- decisions are structured, editable, and budget-aware
- India travel has enough complexity to make the product useful

## India-First Scope

The initial product should be India only.

Why:

- more focused and realistic
- easier to build and explain
- still a huge problem space
- supports multiple meaningful transport types: flights, trains, buses, cabs
- creates strong differentiation through India-specific planning logic

## Product Thesis

People do not plan trips in one shot. They plan in fragments.

They may know:

- only the dates
- only the budget
- only the destination
- only one booked item
- only the kind of trip they want

`Journi` should accept partial intent and help users complete the rest through guided branching options.

## Core Interaction Model

The product should feel like a progressive trip planner with branching block choices.

### High-level flow

1. User enters whatever they know.
2. App understands how planned they already are.
3. App creates the next set of relevant trip blocks.
4. User picks from multiple options.
5. The live trip plan updates instantly.
6. The app keeps proposing the next logical options based on current selections.
7. User can revisit any chosen block and swap it with another option.

## Onboarding Philosophy

The first step should ask:

`How much do you already know?`

Suggested modes:

- Just exploring
- I know destination only
- I know dates and budget
- I already booked some parts

This helps keep the product flexible instead of forcing everyone into the same form.

## Inputs We Discussed

Possible initial inputs:

- source city
- destination city or region
- approximate number of days
- start date and end date
- budget
- number of travelers
- travel style
- preferred transport modes
- places they already want to visit
- things already booked

If a user has only partial information, the system should still work.

## Core UI Structure

### Left side

Current step and available options.

Example:

- pick destination
- choose outbound travel
- choose stay
- choose local movement
- add activities
- choose return travel

### Right side

Live trip canvas that always shows:

- chosen blocks in sequence
- total budget
- travel time
- transfers
- hotel nights
- overall trip timeline

The right side is the persistent state of the trip.

## The Block Concept

Each decision is represented as a block.

This block UI is the heart of the product.

The user experience should feel like:

- keep selecting what you like
- watch your trip start forming on the right
- change any block later if you want
- keep moving forward without friction

The product should feel satisfying and almost playful, while still being useful and practical.

Examples:

- destination block
- outbound travel block
- airport/station transfer block
- stay block
- local transport block
- day plan block
- return block

Each block should show enough information to support decision-making quickly.

Suggested block fields:

- title
- time or duration
- price
- key tags
- why this option
- confidence/recommendation label

## Block Recommendation Types

Each set of options can include labels such as:

- Cheapest
- Fastest
- Best value
- Most comfortable
- Smoothest
- Weekend-friendly

This makes the product feel intelligent without overcomplicating the interface.

## Important UX Rules

### 1. Partial input must work

Users should never need to know the whole trip in advance.

### 1.5. The trip should form as the user chooses

The user should not feel like they are filling out a long form.

They should feel like they are simply choosing between good options, one step at a time, and the trip is naturally assembling itself.

This means:

- every step should present a small set of meaningful choices
- each choice should visibly update the trip canvas
- progress should feel immediate
- the trip should look better and clearer with every selection

### Product principle: hide the planning complexity

All major decision logic should happen internally.

The user should not feel like they are operating a travel optimizer. They should feel like the product is naturally guiding them through a trip plan.

Internally, the system can reason about:

- cost
- speed
- comfort
- transfer count
- timing compatibility
- budget fit
- trip type
- local travel friction

But the UI should present only simple, easy-to-understand outputs such as:

- Best value
- Fastest
- Cheapest
- Smoothest
- Recommended for your trip

Each option should ideally have one short explanation, for example:

- saves 5 hours for a moderate price increase
- better for a short weekend trip
- avoids late-night arrival
- fewer transfers after landing

The core rule is:

Complexity in the engine, simplicity in the interface.

### 2. Editing must be easy

Clicking a chosen block should reopen the original alternatives for that step.

### 3. Budget must always be visible

Every selection should update:

- total trip cost
- per-person cost
- time spent traveling
- remaining budget

### 4. Timing coherence matters

The app should reason about:

- arrival times
- late-night arrivals
- overnight travel
- wasted mornings
- tight transfers
- activity feasibility after travel

### 5. The next option set should depend on current choices

Example:

If a user picks a late-night arrival, the next blocks should favor:

- simple transfer options
- nearby stays
- no intense same-day activity

## Travel Modes

We discussed supporting multiple vehicle types because this is especially important in India.

Possible travel modes:

- flight
- train
- bus
- cab
- metro
- auto
- local transit

The product can become especially strong if it supports multi-leg journeys such as:

- home -> metro -> airport -> flight -> cab -> hotel
- city -> sleeper bus -> auto -> hostel

## Core Product Features

### 1. Smart onboarding

Understand how much the user already knows.

### 2. Step-by-step trip building

Guide users through a structured planning flow.

### 3. Branching option cards

At each step, show several meaningful alternatives.

### 4. Live trip canvas

Build the full plan visually on the right.

### 5. Budget tracking

Continuously update spend and constraints.

### 6. Editable decision history

Allow users to revisit earlier choices.

### 7. Timing-aware planning

Use local time and sequencing to drive smarter next-step suggestions.

## MVP Recommendation

Keep v1 narrow and polished.

### V1 scope

- India only
- 3 to 7 day trip planning
- source city
- destination known or unknown
- approximate days
- start/end dates
- budget
- traveler count
- travel style
- outbound travel options
- stay options
- local transport estimate/options
- return travel options
- optional activity blocks
- live itinerary on the right
- total budget summary
- editable selected blocks

### What v1 must do well

- let the user start with partial information
- generate block options step by step
- keep the trip coherent as choices are made
- make the planning flow feel visual and satisfying

## Source Strategy

The source layer should be realistic, free-first, and narrow.

`Journi` should not depend on scraping the whole web. It should use a small number of selected free APIs and open data sources, then turn those results into normalized planning blocks.

### Core principle

External sources provide candidate options.

`Journi` provides:

- sequencing
- comparison
- budget logic
- timing logic
- trip assembly
- editable block-based planning

The product should own the planning experience, not the raw search infrastructure.

### Recommended v1 source model

Use free or free-tier data sources wherever possible:

- flights: `Travelpayouts Data API`
- geocoding: `Nominatim`
- routing and travel time estimation: `openrouteservice` or `OSRM`
- attractions and destination context: `OpenTripMap`
- destination summaries and travel content: `Wikivoyage`
- trains: only if a reliable free railway API is validated during implementation

### Important note on flights

`Travelpayouts Data API` is useful for planning and route suggestion, but the data is cached rather than guaranteed real-time booking data.

That means flights in `Journi` should initially be treated as:

- planning candidates
- price indicators
- route suggestions

not as guaranteed live booking truth.

### Important note on trains

Train data in India has some free options, but many are unreliable, test-only, or unclear for production usage.

Train support should only be included in v1 if a free source proves dependable enough during implementation.

Otherwise, trains should be:

- limited
- experimental
- or handled through user-assisted link import later

### Important note on buses

Bus APIs in India appear much harder to access for free in a reliable way.

Because of that, buses should not be a core dependency for v1.

If needed, buses can be handled through:

- user-pasted links
- simple estimated travel suggestions
- or postponed until later

### User-assisted import fallback

When source quality is weak, `Journi` should allow users to paste links for:

- stays
- buses
- already chosen travel options
- booked items

The app can then normalize those into trip blocks and continue the planning flow.

This is better than overpromising fully automated coverage.

### Source strategy hierarchy

Use sources in this order:

1. free APIs and open data
2. normalized selected-source extraction
3. user-assisted link import
4. scraping only where necessary and tightly controlled

### Fallback retrieval strategy for niche queries

Some users will ask for routes, stays, or activities that are too niche to be well covered by the primary structured sources.

Examples:

- offbeat destinations
- unusual local transport combinations
- specific trek routes or base villages
- niche stays or operators
- less common travel paths inside India

For these cases, `Journi` should use a fallback retrieval waterfall rather than simply failing.

### Recommended fallback waterfall

1. primary structured sources
2. open travel and content sources
3. targeted web search
4. headless browsing and extraction on selected pages
5. user confirmation or user-pasted link if confidence remains weak

### How this should work internally

When the system cannot generate enough good options from the primary sources, it should:

- search for additional candidate pages from trusted travel-related websites
- evaluate those pages for relevance
- use headless browsing only on strong candidates
- extract useful travel details such as timing, location, duration, pricing, and transfer logic
- normalize that data into internal `Journi` blocks

This lets the product support more unusual cases without making scraping the default strategy.

### Why headless browsing should be last resort

Headless browsing can be powerful, but it is:

- slower
- less predictable
- harder to maintain
- more fragile than structured APIs

Because of that, it should only be triggered when:

- primary sources are missing data
- source confidence is too low
- the trip request is clearly niche or unusual

### Confidence-aware retrieval

`Journi` should maintain internal confidence levels for generated options based on source quality.

Possible internal confidence buckets:

- high confidence: structured source data
- medium confidence: open content and strong search-supported results
- lower confidence: headless-browsed or lightly structured web extraction

These confidence levels do not need to be exposed in technical language, but they should influence ranking and fallback behavior.

### User-facing trust model

The user should not see source-system complexity.

They should only see simple trust-friendly signals such as:

- Recommended for your trip
- Good option from trusted source
- Best available match
- Double-check this before booking

If an option comes from weaker fallback discovery, the product can gently signal uncertainty without sounding technical.

### Product principle for niche handling

If structured data exists, use it.

If not, search the web intelligently.

If still needed, browse and extract selectively.

If confidence is still weak, ask the user to confirm or provide a link.

This ensures graceful degradation instead of dead ends.

### What to avoid

- broad web scraping as the backbone
- Google search snippets as final truth
- claiming live pricing everywhere
- trying to cover every provider in India at launch
- building the product around fragile source dependencies

## Realistic V1 Data Stack

### Destination discovery

Use:

- `OpenTripMap`
- `Wikivoyage`
- optional flight trend hints from `Travelpayouts`

This can power:

- destination suggestions
- trip-style matching
- attraction density
- lightweight destination summaries

### Outbound and return travel

Use:

- `Travelpayouts Data API` for flight candidates
- train APIs only if validated during build

Show these as:

- Cheapest
- Fastest
- Best value
- Smoothest

with short explanations rather than raw API-style output.

### Stay layer

For stays, v1 should stay flexible.

Possible approaches:

- selected free hotel source if workable
- user-pasted stay links
- manually normalized stay candidates for supported destinations

The goal is to preserve the planning UX without overcommitting to brittle stay data extraction.

### Local movement and timing

Use:

- `Nominatim` for place lookup
- `openrouteservice` or `OSRM` for route distance/time estimates

This can power:

- airport/station transfer estimates
- city travel timing
- local movement suggestions
- timing compatibility checks

### Activities and trip shaping

Use:

- `OpenTripMap`
- `Wikivoyage`

This can power:

- activity suggestions
- day-shape options
- destination summaries
- rough attraction clustering

## Launch Scope Recommendation

To keep the product real and free-first, the best launch scope is:

- India only
- flights as primary transport source
- local routing via open mapping tools
- attractions via open travel content
- stays via limited structured sources or pasted links
- trains only if a dependable free source is verified
- buses deferred or user-assisted

This gives `Journi` enough real functionality to feel useful while staying technically realistic.

## Reliability and Trust Rules

Because travel data changes often, the product should be careful about what it promises.

### Internal reliability rules

- prefer structured sources whenever available
- treat cached price data as planning guidance, not guaranteed booking truth
- use web search and browsing only as fallback layers
- normalize all candidate options before presenting them
- rank options with both relevance and source confidence in mind

### User-facing reliability rules

Avoid technical phrasing such as:

- scraped result
- low-confidence extraction
- search-index fallback

Instead use simple human-friendly language such as:

- best available option
- worth double-checking
- good fit for your trip
- recommended based on current availability

### Core trust principle

`Journi` should always feel helpful and smart, but never overclaim certainty when the data is weak.

## Suggested First-Step Fields

- Where are you starting from?
- Where do you want to go? (optional)
- When are you planning to travel?
- About how many days?
- What's your approximate budget?
- How many people?
- What kind of trip is this?

Possible trip styles:

- relaxed
- adventure
- food
- nightlife
- family
- backpacking
- luxury

## Suggested Step Sequence

1. Trip intent and known info
2. Destination options or destination confirmation
3. Outbound travel options
4. First transfer / arrival logic
5. Stay options
6. Local transport options
7. Activity or day-shape options
8. Return travel options
9. Final summary and checklist

## Example Experience

Example user intent:

- starting city: Bangalore
- maybe destination: Goa
- 4 days
- 2 people
- budget: mid-range

The app might show:

- Option A: faster flight, higher cost
- Option B: cheaper overnight bus
- Option C: mixed rail + cab option

Once the user chooses one:

- total cost updates
- arrival timing updates
- stay suggestions adapt
- transfer options adapt
- the final trip begins forming visually

## Recommendation Engine Principles

The app should not dump a giant list.

It should propose a curated next set of options based on:

- cost
- duration
- comfort
- transfer count
- trip type
- number of days
- current itinerary state
- timing compatibility

## Smart Tags We Discussed

These can help the product feel premium and India-aware:

- overnight travel
- arrives too late
- good morning arrival
- saves day 1
- fewer transfers
- budget friendly
- smoother route
- better for weekend trip
- backpacker-friendly
- family-friendly

## Future Enhancements

Not for v1, but good future directions:

- trip templates such as `3-day Goa` or `Jaipur weekend`
- group planning and cost split
- saved preferences
- richer local activity suggestions
- weather and season awareness
- crowd or peak-time warnings
- manual import of already-booked tickets or stays
- route graph visualization

## Ideas We Explicitly Want To Avoid

- chat-first experience
- generic itinerary generator
- scraping every travel site in real time
- in-app booking in v1
- giant marketplace behavior
- trying to support the whole world immediately

## Product Differentiator

The differentiator is not AI text generation.

The differentiator is:

- partial-input planning
- branching decision blocks
- live visual trip formation
- budget and timing awareness
- editable decision tree

In short:

`Journi` is a trip decision canvas, not a trip chatbot.

## Brand Notes

### Name

`Journi`

Why it works:

- short
- modern
- consumer-friendly
- travel-native
- flexible enough to grow beyond just "canvas"

### Hero line

`Plan your trip, one choice at a time.`

### Alternative line

`Build your trip step by step in one place.`

## Design Direction

The product should feel extremely easy to use for normal consumers, not technical users.

The visual design should avoid the typical AI-product look:

- no dark black-heavy interface
- no neon purple AI aesthetic
- no overly futuristic dashboard feel

Instead, the design should feel:

- natural
- calm
- warm
- travel-friendly
- clean
- trustworthy

### Suggested visual mood

Think:

- soft nature-inspired colors
- light backgrounds
- earthy greens
- sand, sky, and muted blue tones
- subtle contrast
- generous spacing
- clean cards

The overall feeling should be:

`This helps me plan a trip easily.`

not

`This is an AI control panel.`

## UX Principles

### 1. Consumer-first simplicity

This should feel easy enough for anyone planning a trip, not just power users.

### 2. Calm over flashy

The product should feel pleasant and low-stress. Trip planning is already chaotic, so the interface should reduce anxiety instead of increasing it.

### 3. Visual clarity over density

Do not overload the screen with too much information at once. Each step should focus attention on just the next meaningful decision.

### 4. Friendly, non-technical language

Use plain labels and explanations. Avoid sounding like a recommendation engine or optimization system.

### 5. High-trust presentation

Users should feel that the product is careful, understandable, and safe to rely on.

## What Success Looks Like

A user should be able to:

1. open the app with only partial trip knowledge
2. answer a few setup questions
3. choose from smart option blocks
4. watch a full trip plan take shape on the right
5. edit earlier decisions without breaking the flow
6. leave with a coherent itinerary and budget

## Final V1 Scope Decision

To avoid overbuilding, the first version of `Journi` should be locked to a clear and achievable scope.

### V1 should include

- India-only trip planning
- consumer-first onboarding with partial information
- destination discovery or destination confirmation
- outbound travel option blocks
- stay option blocks
- local movement and transfer estimates
- return travel option blocks
- optional activity or day-shape blocks
- right-side live trip canvas
- budget and timing updates after every choice
- editable earlier decisions
- save and resume trip plans
- shareable final trip summary

### V1 source approach

- free APIs and open data first
- selected-source normalization
- user-pasted links where needed
- web search and headless browsing only as fallback for niche cases

### V1 transport priority

1. flights
2. local route and transfer estimates
3. trains only if validated during build
4. buses deferred unless user-assisted

### V1 destination priority

Focus on making the planning experience excellent for a manageable set of Indian trips rather than trying to support every possible route equally well.

If needed, the first release can be strongest on:

- popular metro departures
- short leisure trips
- weekend and 3 to 7 day journeys

### V1 should not include

- in-app booking
- global travel support
- fully automated coverage of every provider
- full real-time guarantee across all pricing
- group collaboration
- visa/document systems
- heavy social features
- marketplace behavior

### V1 success criteria

The first version is successful if users can:

- start with incomplete trip knowledge
- make decisions through simple option blocks
- see their trip form clearly as they choose
- trust the recommendations enough to move forward
- finish with a plan that feels coherent, flexible, and easy to revisit

## Summary

`Journi` should feel like a visual planning workspace for real India trips.

The product wins if it makes people feel:

- I don't need to know everything upfront
- I can see my trip forming
- each decision makes sense
- I can compare options without chaos
- my total budget and timing stay under control
