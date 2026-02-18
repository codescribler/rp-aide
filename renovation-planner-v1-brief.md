# Renovation Planner — Estimating Tool V1

## Project Brief

A progressive web app that helps UK building contractors produce bills of quantities and cost estimates for renovation and construction projects. It replaces the spreadsheet-based workflow currently used across the industry.

The app must work offline (builders have poor signal on site) and produce PDF estimates matching the industry-standard format shown in the reference documents.

---

## What It Does

The builder creates a new project, selects a project type, gets a pre-populated list of common line items grouped by trade section, adjusts quantities and rates, and exports a professional PDF estimate.

---

## User Flow

### 1. Create Project

Builder enters:

- Project name
- Location / address
- Client name
- Architect name
- Date
- Project type (selects one): New Build, Extension, Loft Conversion, Garage Conversion, Kitchen Refit, Bathroom Refit

Selecting a project type loads a **template** — a pre-populated set of line items relevant to that work type. The builder can also start from a blank project or clone a previous project.

### 2. Edit Bill of Quantities

The main working screen. Line items are grouped by **sections** (see Data Structures). For each item the builder can:

- Toggle it on/off (inactive items are hidden from the estimate but not deleted)
- Edit the description
- Enter quantity (with a unit shown, e.g. m², m, nr)
- Enter unit cost (£)
- See calculated item cost (quantity × unit cost)

The builder can also:

- Add custom line items to any section
- Reorder items within a section
- Set a **global markup percentage** applied to all unit costs (e.g. 125%, 140%)
- Add notes/exclusions text that appears at the bottom of the estimate

Each section shows a running subtotal. A grand total is always visible.

### 3. Inline Quantity Calculators

When entering a quantity, the builder can open a simple calculator panel for that item. Calculators by unit type:

- **m² (area):** Enter length × width. Supports adding multiple rectangles that sum together (e.g. three wall sections).
- **m³ (volume):** Enter length × width × depth.
- **m (linear):** Enter multiple lengths that sum.
- **nr (count):** Direct entry.
- **kg (weight):** Enter length in metres × weight per metre (for steelwork).

The calculated result populates the quantity field. The individual measurements are saved so the builder can review/edit them later.

### 4. Export PDF

Generates a PDF matching the standard format:

**Header on every page:**
- Project name, location
- Client / architect
- Prepared by, checked by, date, revision number

**Body:**
- Numbered line items in a table: SR NO | DESCRIPTION | QTY | UNIT | UNIT COST | ITEM COST
- Grouped under section headings (A DEMOLITION, B STRUCTURE, etc.) with lettered prefixes
- Section subtotals shown in a BILL COST column
- Sequential numbering across all sections

**Footer:**
- Grand total
- Notes & Exclusions list
- Units legend (nr, m, m², m³, kg, p/s, riser, item, etc.)
- Page X of Y

### 5. Project Dashboard

A list of all saved projects showing name, client, date, and total value. The builder can open, clone, or delete projects.

---

## Data Structures

### Item Library

The master list of reusable line items. Seeded with data extracted from reference estimates.

```
ItemTemplate {
  id: string
  description: string        // e.g. "12.5mm dot and dab plasterboard finish"
  unit: enum                 // m2, m, m3, nr, kg, riser, item, ps (provisional sum)
  defaultUnitCost: number    // optional, £
  section: string            // reference to Section
  tags: string[]             // e.g. ["loft", "extension", "new-build"]
}
```

### Sections

Fixed set of trade sections. Every estimate uses the same section structure.

```
Section {
  id: string
  letter: string             // A, B, C, D, E, F, G
  name: string               // e.g. "DEMOLITION", "STRUCTURE", "ARCHITECTURE"
  subsections: string[]      // e.g. ["CONCRETE", "BLOCKWORK", "TIMBER FRAMING", "METAL FRAMING"]
}
```

Standard sections:

- A — DEMOLITION
- B — STRUCTURE (subsections: Concrete, Blockwork, Timber Framing, Metal Framing)
- C — ARCHITECTURE (subsections: Roofing, Exterior Finish, Insulation, Waterproofing, Doors, Windows, Rooflights, Plaster Linings, Floor Finishes, Base Finishes, Wall Finishes, Ceiling Finishes, Stairs & Railings, Joinery, Specialities)
- D — DRAINAGE WORKS
- E — MECHANICAL SERVICES (Plumbing)
- F — ELECTRICAL SERVICES
- G — SITE WORK

### Project Templates

Pre-built collections of ItemTemplates for each project type.

```
ProjectTemplate {
  id: string
  name: string               // e.g. "Loft Conversion"
  projectType: enum
  items: ItemTemplate[]      // subset of the full library relevant to this type
}
```

### Project

A specific estimate being prepared.

```
Project {
  id: string
  name: string
  location: string
  clientName: string
  architectName: string
  preparedBy: string
  checkedBy: string
  date: date
  revision: string           // e.g. "00", "01", "00a"
  projectType: enum
  markupPercentage: number   // e.g. 1.25 for 125%
  notes: string[]            // notes & exclusions
  lineItems: LineItem[]
}
```

### Line Item

A single row in the estimate.

```
LineItem {
  id: string
  projectId: string
  serialNumber: number       // auto-calculated, sequential across all sections
  section: string
  subsection: string
  description: string
  quantity: number
  unit: enum
  unitCost: number           // £, before markup
  isActive: boolean
  sortOrder: number
  measurements: Measurement[]  // from the quantity calculator
}
```

Computed fields:
- `adjustedUnitCost` = unitCost × project.markupPercentage
- `itemCost` = quantity × adjustedUnitCost

### Measurement

Individual measurements that sum to a line item's quantity.

```
Measurement {
  id: string
  lineItemId: string
  label: string              // e.g. "Kitchen north wall", "Bedroom 1"
  dimension1: number         // length
  dimension2: number         // width (for m²) or null
  dimension3: number         // depth (for m³) or null
  result: number             // calculated value
}
```

---

## Project Templates — Initial Content

Seed the app with six templates derived from the reference estimates. Each template is a pre-populated set of line items the builder can toggle on/off and adjust. Default unit costs are included where the reference data provides them; otherwise leave blank for the builder to fill in.

### 1. New Build Template

_Reference: The White Hart, Marden — 2-storey duplex villas, £1.7m_

**A — Demolition:** (none by default — new build)

**B — Structure**

_Concrete:_ 150mm C32/40 RC ground bearing slab with A393 mesh (m², £120), 75mm cement screed (m², £50), 1200 gauge polythene DPM (m², £15), 50mm sand blinding (m², £30), 200mm well compacted hardcore (m², £25), isolated pad footings 1000×1000×600mm (m³, £600), isolated pad footings 1400×1400×600mm (m³, £600), isolated pad footings 2000×2000×600mm (m³, £600), trench footing 450×600mm (m³, £600), trench footing 600×600mm (m³, £600), lean concrete fill to DPC level at foundation brickwork (m², £25).

_Blockwork:_ Engineering foundation brickwork outer leaf 100mm (m², £100), engineering foundation brickwork inner leaf 100mm (m², £100), 100mm engineering foundation brickwork single skin (m², £100), external cavity wall 100mm concrete blocks inner leaf (m², £45), 103mm facing brickwork (m², £120), internal cavity wall 100mm concrete blocks one side (m², £45), internal cavity wall 100mm concrete blocks other side (m², £45), 100mm internal block wall half hour fire rated (m², £45), padstone 300×100×150 (nr, £250), padstone 500×100×150 (nr, £437.50).

_Timber Framing:_ 47×147 C24 floor joists @ 400 c/c (m², £45), 100mm internal stud wall half hour fire rated (m², £40), 150mm external stud 100×50 timber @ 400 c/c (m², £45), 147×70 C24 roof joists @ 400 c/c flat roof (m², £55), 47×125 C24 rafters @ 400 c/c pitched roof (m², £65), 47×147 C24 rafters @ 400 c/c pitched roof (m², £70), 22mm chipboard subfloor (m², £25), 18mm external grade plywood sheathing flat roof (m², £25), ridge beam 2 No. 220×47 C24 (m, £137.50), 47×170 C24 valley rafter (m, £100), lintel 2 No. 47×147 timber (m, £162.50), 47×170 C24 rafters doubled around rooflights/dormers (m, £100), 12mm external plywood sheathing dormer stud wall (m², £25), 25mm tapered firrings 1:40 flat roof (m², £15), 50×25mm battens pitched roof (m², £20), 75×100mm C16 wall plate (m, £75), 100×50mm top and bottom plate external stud wall (m, £62.50).

_Metal Framing:_ 152×152×23 UC (kg, £5.63), 152×152×30 UC (kg, £5.63), 254×254×73 UC (kg, £5.63), 178×102×19 UB (kg, £5.63), 152×89×16 UB (kg, £5.63), 203×102×23 UB (kg, £5.63), steel columns 152×152×30 UC (kg, £5.63), steel columns 254×254×73 UC (kg, £5.63), base plates 300×200×12mm S275 (nr, £150), base plates 300×300×15mm S275 (nr, £200), end plates 365×275×20mm welded to beam (nr, £225), Catnic BSD100 lintels (m, £68.75), Catnic CG90/100 lintels (m, £68.75), 152×89×16 UB lintels (kg, £5.63), 140×100 precast concrete lintels (m, £100), Catnic CXL290 fabricated lintel (m, £68.75), Catnic splayed bay lintel (m, £75), stainless steel wall ties @ 450mm vert / 750mm horiz centres (m², £15), lateral restraint 30×5mm galv straps @ 2000 c/c (p/s, £1250).

**C — Architecture**

_Roofing:_ GRP finish flat roof (m², £80), roof tiles pitched roof (m², £120), stone coping with flashing (m, £75), ridge with ventilated strip and underlay (m, £62.50), rainwater downpipes (nr, £162.50).

_Exterior Finish:_ External wall tiles (m², £45), barge board (m, £43.75), eave fascia board (m, £43.75), stylish barge board (m, £50), uPVC guttering (m, £31.25).

_Insulation:_ 25mm perimeter insulation ground floor (m, £31.25), 100mm Kingspan TF70 ground floor (m², £60), 110mm Kingspan insulation floor joists (m², £65), 50mm PIR insulation cavity walls (m², £50), unfaced mineral wool 25mm internal stud walls (m², £25), 40mm insulation dormer external stud walls (m², £40), 100mm insulation dormer external stud walls (m², £60), 50mm PIR insulation flat roof (m², £50), 40mm Kingspan Kooltherm K118 pitched roof (m², £60), 110mm Kingspan Kooltherm K7 between rafters pitched roof (m², £70).

_Waterproofing:_ Code 4 lead flashing (m, £100), breather membrane pitched roof (m², £15), vapour control layer flat roof (m², £15), 6mm calcium silicate board cavity wall support (m, £31.25).

_Doors:_ External bi-fold door 1300×2100mm (nr, £1562.50), external single door 1020×2100mm (nr, £1250), external single door with sidelite one side 1369×2137mm (nr, £1687.50), external single door with sidelites both sides 1800×2100mm (nr, £2187.50), internal double door 838×1961mm (nr, £3312.50), internal single door 838×1961mm (nr, £875), internal single FD30S fire door 838×1961mm (nr, £875), ironmongery (nr, £312.50).

_Windows:_ External window 400×1330mm (nr, £312.50), external window 600×1248mm (nr, £437.50), external window 800×1248mm (nr, £562.50), external window 1200×1248mm (nr, £875), external window 1800×1330mm (nr, £1375).

_Rooflights:_ Rooflight 1200×560mm (nr, £562.50).

_Plaster Linings:_ 12.5mm dot and dab plasterboard both sides internal walls and inner skin external (m², £25), 12.5mm moisture resistant aquapanel plasterboard wet areas (m², £25).

_Floor Finishes:_ Oak flooring (m², £80), tile flooring (m², £110), level door threshold (m, £62.50).

_Base Finishes:_ MDF pencil line skirting (m, £12.50).

_Wall Finishes:_ Wall paint 3mm skim + 2 coats emulsion (m², £45), wall tile (m², £120).

_Ceiling Finishes:_ 12.5mm suspended plasterboard ceiling 30 min fire rated + skim + emulsion (m², £65).

_Stairs & Railings:_ Internal timber stairs 200mm high 950mm wide (riser, £562.50), handrail (m, £75), 1.1m exterior railing (m, £100).

_Joinery:_ 600mm bottom cabinets (m, £812.50), 300mm top cabinets (m, £562.50), 600mm storage (m, £500), kitchen worktop with 4" splashback (m², £350), utility worktop with 4" splashback (m², £350).

_Specialities:_ Prefabricated GRP chimney 635×1060mm (nr, £3750), exterior signage (nr, £750).

**D — Drainage Works:** 110mm above ground drainage pipes uPVC (p/s, £7500), surface water drainage (m, £87.50), foul water drainage (m, £137.50), trench drain (m, £125), water mains (m, £150).

**E — Mechanical Services:** Bath tub 700×1700mm (nr, £812.50), 100mm soil vent pipe (nr, £625), kitchen sink with faucet (nr, £562.50), utility sink with faucet (nr, £437.50), sink with faucet (nr, £562.50), toilet commode (nr, £562.50), vanity unit 400×250mm (nr, £687.50), shower 1300×800mm (nr, £812.50), shower enclosure 800×800mm (nr, £625), kitchen island 2600×1200mm (nr, £1250), 32mm specialist UFH buildup (m², £60).

**F — Electrical Services:** 13 amp appliance flex outlet (nr, £125), 13 amp double switch socket outlet (nr, £137.50), 13 amp single socket outlet (nr, £125), 13 amp single switch fused spur with neon (nr, £137.50), shaver socket (nr, £150), bulkhead light fitting (nr, £150), Cat 6 data outlet (nr, £125), customer consumer unit (nr, £1875), downlight chrome finish (nr, £150), electrical towel rail switched fused spur (nr, £250), external lighting energy efficient (nr, £250), external security lighting with PIR (nr, £250), illuminated doorbell system (nr, £250), light switch (nr, £112.50), mirror with built-in light (nr, £137.50), moisture resistant bathroom lighting (nr, £162.50), pendant energy efficient light fitting (nr, £187.50), single telephone socket (nr, £137.50), switch fused spur for boiler (nr, £187.50), TV/satellite/FM/DAB outlet socket (nr, £137.50), thermostat (nr, £312.50), three way light switch (nr, £162.50), two way light switch (nr, £150), heat detector (nr, £312.50), smoke detector (nr, £312.50).

**G — Site Work:** Storage attenuation crates (m², £100), concrete sidewalk (m², £150), sewage treatment plant (nr, £7500), native mixed hedgerow planting (m², £100), planters (nr, £250).

---

### 2. Extension Template

_Reference: 24 David Road, Paignton — addition & renovation, £132k_

**A — Demolition:** Existing exterior wall to be removed (m², £58.82), existing partition wall to be removed (m², £35.87), existing boiler to be repositioned (item, £1000), existing countertop to be removed (m², £30), existing deck boards to be removed (m², £30), existing cabinets to be removed (m, £100), existing exterior window to be removed (nr, £100), existing gas meter to be repositioned (item, £600), existing interior double door to be removed (nr, £120), existing interior single door to be rehanged (nr, £100), existing interior single door to be removed (nr, £100), existing interior single door with glass panel to be removed (nr, £100), existing interior window to be removed (nr, £100), existing kitchen island to be removed (item, £300), existing railing to be removed (m, £30), existing roof covering and structure to be removed (m², £60), existing spindrel stud wall to be removed (m², £30), existing steps to be removed (riser, £150), existing velux window to be removed (nr, £100), existing lintels to be removed (nr, £50), existing flooring to be removed (m², £20), existing ceiling to be removed (m², £15), existing storage to be removed (m, £30).

**B — Structure**

_Concrete:_ 450×600mm continuous footing (m³, £450), excavation (m³, £95), backfill (m³, £30), 75mm concrete slab (m², £60), 1200G DPM (m², £15).

_Blockwork:_ External wall 100mm PCC block + 100mm cavity (m², £120), dwarf exterior wall with cavity insulation (m², £120), existing exterior wall raised height (m², £120), PCC blockwork below dwarf wall (m², £100), double skin PCC block stem wall (m², £150).

_Timber Framing:_ Flat roof joists 150×50 C24 @ 400 c/c (m², £60), new stud nib (m², £30), stud wall headboard/screen (m², £35), 150×50 C24 flat roof joists @ 400 c/c (m², £60), internal timber stud wall 100×100 treated @ 400 c/c (m², £45), 40×140 C16 dormer stud wall @ 600 c/c (m², £55), 12mm OSB sheathing dormer walls (m², £30), 200×50 C24 ridge beam (m, £80), 200×50 C24 valley beam (m, £80), 150×50 C24 dormer roof rafters (m², £70), 150×50 C24 floor joists (m², £70), 22mm flooring grade chipboard on joists (m², £25), external grade ply deck on firrings flat roof (m², £35), bottom plate dormer stud wall (m, £20), two top plates dormer stud wall (m, £30), fill rafters/felt/battens/tiles at existing velux (m², £25), 37.5mm insulated plasterboard skim at dormer walls (m², £50), 13mm wet plasterboard inner side exterior walls (m², £35), 12.5mm gyproc wallboard and skim plaster (m², £30).

_Metal:_ 152×89 UB16 frame (m, £56), 150×90 PFC within floor zone (m, £84), (2)175×50 C24 within floor zone (m, £150), 900mm handrail (m, £550), 1.1m guarding to decking (m, £650), Catnic CG/90 lintels (m, £50), stainless steel wall ties (p/s, £800).

**C — Architecture**

_Roofing:_ Dormer roof tiles on treated battens with Tyvek underlay (m², £120), fibreglass roofing system flat roof (m², £60), eaves drip with masterboard (m, £45), aluminium gutter (m, £40), fascia board (m, £35), downspouts (m, £40).

_Exterior Finish:_ Sand cement render on EML on battens (m², £50), 19mm sand cement render on exterior walls (m², £50).

_Insulation:_ Vertical DPC at window/wall junction with lead flashing (m, £30), continuous DPC both skins 150mm above ground (m, £30), cavity tray at roof/wall junction with lead flashing (m, £20), 130mm Celotex dormer roof (m², £30), 140mm Celotex dormer wall (m², £35), 150mm Celotex floor joists (m², £40), 150mm Kingspan Thermaroof flat roof (m², £80), 100mm acoustic rockwool batt in studs (m², £50), 90mm Celotex Thermaclass cavity wall 21 (m², £25).

_Doors:_ FD30S UPVC/aluminium double glazed interior single door 750×2035mm (nr, £800), UPVC/aluminium bi-fold door 2300×2200mm (nr, £2800), UPVC/aluminium exterior double door 1420×2035mm (nr, £1500), UPVC/aluminium exterior double door with glass panels both sides 1420×2035mm (nr, £1500), ironmongery (nr, £250).

_Windows:_ UPVC/aluminium double glazed dormer window with glass panel 2330×1500mm (nr, £1800), UPVC/aluminium double glazed window 1390×1300mm (nr, £950).

_Glass Work:_ Pitched glass roof conservatory (m², £400), glass panel over dwarf wall conservatory (m², £350).

_Steps:_ Steps various sizes (riser, £180–790 depending on size).

_Ceiling Finishes:_ Ceiling at extended area (m², £80).

_Floor Finishes:_ Suspended timber flooring with LVT (m², £150), composite decking (m², £120), kitchen tile countertop (m², £150).

_Second Fix:_ MDF pencil line skirting (m, £15), architraves (m, £25).

_Wall Finishes:_ Wall paint (m², £35).

_Cabinetry:_ Base cabinets (m, £650), upper cabinets (m, £550).

**D — Plumbing & Electrical:** Provisional sum for electrical work (p/s, £5000), provisional sum for plumbing work (p/s, £4000).

**E — Kitchen:** Supply of kitchen items (p/s, £7142.86), installation of kitchen items (p/s, £2035.71).

---

### 3. Loft Conversion Template

_Reference: 30 Grayling Rd, London — loft conversion, £70k_

**A — Demolition:** Remove existing pitched roofing incl. slates/tiles, rafters, plywood, insulation (m², £55), remove existing rooflight (nr, £100), remove pitched ceiling first floor if in place (p/s, £1000).

**B — Structure**

_Timber Framing:_ 50×150mm C24 flat roof joist framing (m², £45), 50×150mm C24 loft floor joist framing (m², £45), 18mm WBP plywood subflooring (m², £25), 18mm marine roof plywood (m², £25), furring partition wall 47×100 treated studs @ 400 c/c (m², £40), internal partition wall 47×100 treated studs @ 400 c/c (m², £40).

**C — Architecture**

_Roofing:_ Flat roof GRP finish with vapour barrier (m², £100), lead/copper flashing (m, £50), roof drain (nr, £150).

_Insulation:_ 150mm Kingspan Kooltherm roof insulation (m², £45), 100mm Kingspan Kooltherm floor insulation (m², £40), rockwool batt insulation inside stud cavity (m², £25).

_Doors:_ Internal double door painted solid core 1524×2100mm (nr, £1300), internal single door painted solid core 662×2100mm (nr, £600), internal single door painted solid core 762×2100mm (nr, £650), ironmongery (nr, £250).

_Rooflights:_ Rooflight 800×700mm (nr, £350).

_Plaster Linings:_ 12.5mm plasterboard on studwork (m², £25), 12.5mm Wediboard in wet areas (m², £30).

_Floor Finishes:_ Oak flooring (m², £90), tile flooring (m², £100).

_Base Finishes:_ MDF pencil line skirting (m, £15).

_Wall Finishes:_ Wall paint 3mm skim + 2 coats emulsion (m², £45), wall tile (m², £120).

_Ceiling Finishes:_ 12.5mm suspended plasterboard ceiling + skim + emulsion (m², £45), 12.5mm suspended plasterboard ceiling + skim + emulsion allowance for existing first floor (m², £45).

_Stairs & Railings:_ Internal timber stairs 800mm wide + 1 landing step (riser, £350), stair handrail (m, £200), stair railing (m, £450).

_Specialities:_ Bedroom wardrobe 600mm wide (m, £60), internal decorative timber railing 1m high (m, £60).

**D — Plumbing:** Bath tub 1700×750mm (nr, £450), shower pan curved 800×800mm (nr, £650), water closet (nr, £350), handbasin (nr, £350), misc piping (p/s, £2000).

**E — Electrical:** Electrical works (p/s, £3000).

**F — Mechanical:** Mechanical works (p/s, £2000).

---

### 4. Garage / Ground Floor Conversion Template

_Reference: 3 Glenwood Close, Swindon — ground floor conversion with loft addition_

Note: The reference estimate has quantities but no unit costs. Default costs are left blank for the builder to fill in from their own rates.

**A — Demolition:** Existing internal stud wall to be removed (m²), existing internal half wall to be removed (m²), existing external double door to be removed (nr), existing external window to be removed (nr), existing floor finish to be removed (m²), existing internal single door to be removed (nr), existing sink with faucet to be removed (nr), existing stove to be removed (nr), existing cupboard to be removed (m), existing kitchen worktop to be removed (m²), existing bottom cabinets to be removed (m), existing top cabinets to be removed (m), existing plasterboard ceiling to be removed (m²), existing floor with assembly to be removed (m²), existing truss members to be removed (m), existing ridge with accessories to be removed (m), existing external block wall to be removed (m²), existing roof with assembly to be removed (m²), existing uPVC gutter to be removed (m), existing boiler to be removed (nr), existing equipment to be removed (nr), existing Catnic lintel to be removed (m).

**B — Structure**

_Blockwork:_ External block wall 100mm double skin with cavity insulation (m²).

_Timber Framing:_ 50×150mm C24 roof joists @ 400 c/c (m²), 50×200mm C24 floor joists @ 400 c/c (m²), 125mm loft stud wall 47×100 treated studs @ 400 c/c (m²), 125mm internal stud wall 47×100 treated studs @ 400 c/c (m²), 100×47mm treated bottom and top plates (m), 22mm plywood subfloor (m²), 18mm marine roof plywood (m²), timber header (m).

_Metal:_ Catnic CN99/394C lintel (m).

**C — Architecture**

_Roofing:_ Single membrane cold flat roof (m²), barge board (m), uPVC gutter (m).

_Exterior Finish:_ Render finish (m²), dormer external finish timber cladding (m²).

_Insulation:_ 100mm Kooltherm cavity walls (m²), 100mm Celotex GA4000 roof (m²), 125mm rockwool insulation stud walls (m²).

_Waterproofing:_ Ridge flashing (m).

_Doors:_ External double swing door 1200×2100mm (nr), external double swing door 1650×2100mm (nr), internal single sliding door 800×2100mm (nr), internal single swing door 800×2100mm (nr), ironmongery (nr).

_Windows:_ External window 600×1050mm (nr), external window 900×1050mm (nr), external window 1800×1050mm (nr), external window 2400×1050mm (nr).

_Rooflights:_ Rooflight 800×1200mm (nr).

_Plaster Linings:_ 12.5mm plasterboard on stud walls and blockwork (m²), 12mm Wediboard wet areas (m²).

_Floor Finishes:_ Wood flooring (m²), carpet flooring (m²), tile flooring (m²).

_Base Finishes:_ MDF line skirting (m).

_Wall Finishes:_ Wall paint 3mm skim + 2 coats emulsion (m²), wall tile (m²).

_Ceiling Finishes:_ 12.5mm plasterboard ceiling with skim finish (m²).

_Stairs:_ Wooden stairs 830mm wide 200mm rise (riser), guardrail with post 1.5m high (m), stair railing (m).

_Joinery:_ 600mm bottom cabinets (m), 600mm kitchen worktop with 4" splashback (m²), 600mm utility worktop with 4" splashback (m²).

**D — Plumbing:** Sink with faucet (nr), water closet (nr), fixed bath tub 700×1700mm (nr), rainwater downpipe (nr).

**E — Electrical:** Electrical works allowance (sum).

---

### 5. Kitchen Refit Template

_Derived from common items across all four reference estimates_

**A — Demolition:** Existing kitchen island to be removed (item, £300), existing countertop to be removed (m², £30), existing bottom cabinets to be removed (m, £30), existing top cabinets to be removed (m, £30), existing sink with faucet to be removed (nr, £50), existing stove to be removed (nr, £50), existing flooring to be removed (m², £20), existing wall tiles to be removed (m², £25), existing ceiling to be removed (m², £15), existing interior door to be removed (nr, £100).

**B — Structure**

_Blockwork:_ New blockwork for layout changes (m², £45).

_Timber Framing:_ Internal timber stud wall 100×100 treated @ 400 c/c (m², £45), 12.5mm gyproc wallboard and skim plaster (m², £30).

_Metal:_ Catnic lintel over new opening (m, £68.75), steel beam for knock-through (kg, £5.63).

**C — Architecture**

_Insulation:_ Acoustic rockwool batt in new stud walls (m², £25).

_Doors:_ Internal single door (nr, £875), ironmongery (nr, £250).

_Windows:_ External window replacement (nr, £562.50).

_Floor Finishes:_ Tile flooring (m², £110), LVT flooring (m², £75), level door threshold (m, £62.50).

_Base Finishes:_ MDF pencil line skirting (m, £12.50).

_Wall Finishes:_ Wall paint 3mm skim + 2 coats emulsion (m², £45), wall tile splashback (m², £120).

_Ceiling Finishes:_ 12.5mm plasterboard ceiling + skim + emulsion (m², £65).

_Joinery:_ 600mm bottom cabinets (m, £812.50), 300mm top cabinets (m, £562.50), kitchen worktop with 4" splashback (m², £350), utility worktop with 4" splashback (m², £350), kitchen island (nr, £1250).

**E — Mechanical Services:** Kitchen sink with faucet (nr, £562.50), utility sink with faucet (nr, £437.50), 13 amp appliance flex outlet (nr, £125), extractor/cooker hood ducting (item, £300), radiator or UFH zone (p/s, £500).

**F — Electrical Services:** 13 amp double switch socket outlet (nr, £137.50), 13 amp single switch fused spur with neon (nr, £137.50), downlight chrome finish (nr, £150), light switch (nr, £112.50), two way light switch (nr, £150), switch fused spur for boiler (nr, £187.50).

---

### 6. Bathroom Refit Template

_Derived from common items across all four reference estimates_

**A — Demolition:** Existing bath tub to be removed (nr, £80), existing shower to be removed (nr, £80), existing WC to be removed (nr, £50), existing handbasin/vanity to be removed (nr, £50), existing wall tiles to be removed (m², £25), existing floor tiles to be removed (m², £25), existing plasterboard to be removed (m², £15), existing towel rail to be removed (nr, £30).

**B — Structure**

_Timber Framing:_ Internal stud wall for en-suite partition (m², £40), stud wall headboard/screen (m², £35).

**C — Architecture**

_Insulation:_ Acoustic rockwool batt in stud walls (m², £25).

_Doors:_ Internal single door (nr, £875), ironmongery (nr, £250).

_Plaster Linings:_ 12.5mm moisture resistant aquapanel plasterboard (m², £25), 12.5mm Wediboard attached to tilework wet areas (m², £30).

_Floor Finishes:_ Tile flooring (m², £100).

_Wall Finishes:_ Wall tile (m², £120).

_Ceiling Finishes:_ 12.5mm plasterboard ceiling + skim + emulsion (m², £65).

**E — Mechanical Services:** Bath tub 700×1700mm (nr, £812.50), shower 1300×800mm (nr, £812.50), shower enclosure 800×800mm (nr, £625), water closet (nr, £562.50), handbasin (nr, £350), vanity unit 400×250mm (nr, £687.50), misc piping (p/s, £2000), 100mm soil vent pipe (nr, £625).

**F — Electrical Services:** Shaver socket (nr, £150), electrical towel rail switched fused spur (nr, £250), moisture resistant bathroom lighting (nr, £162.50), mirror with built-in light (nr, £137.50), extractor fan (nr, £150), light switch (nr, £112.50), downlight chrome finish (nr, £150).

---

## Offline & Storage

The app must be a PWA with full offline support. All project data is stored locally (IndexedDB or equivalent) and optionally syncs to a cloud database when online. The builder must never lose work due to connectivity issues.

---

## PDF Output Specification

The PDF must closely match the format of the reference estimates. Key requirements:

- A4 portrait orientation
- Header table with project details repeated on every page
- Line items in a bordered table with alternating row shading for readability
- Section header rows in bold with a shaded background
- Subsection header rows in bold
- Section subtotals right-aligned in a "BILL COST" column
- Grand total row at the bottom
- Notes & exclusions section
- Units legend
- Page numbering: "ESTIMATE X of Y"
- Professional, clean typography — no decorative fonts

---

## What Is NOT in V1

- User accounts / authentication (single user, local storage only)
- Supplier pricing integration
- Scheduling / Gantt charts / project timelines
- Multi-user collaboration
- Client-facing portal
- Photo attachments
- Drawing measurement tools
- Invoicing or accounting
- Material ordering

---

## Unit Types Reference

| Code | Meaning | Example |
|------|---------|---------|
| m² | Area in square metres | Plasterboard, flooring, blockwork |
| m | Linear metres | Skirting, guttering, handrail |
| m³ | Volume in cubic metres | Concrete, excavation |
| nr | Number / count | Doors, windows, sockets |
| kg | Kilograms | Steelwork (beams, columns) |
| riser | One stair step | Stairs |
| item | Single item | Boiler repositioning |
| p/s | Provisional sum / allowance | Electrical works, plumbing |
| sum | Lump sum | Landscaping allowance |

---

## Success Criteria

A builder can:

1. Create a new loft conversion or extension project in under 2 minutes
2. Enter all quantities for a typical project in under 30 minutes
3. Export a professional PDF estimate they would be confident sending to a client
4. Do all of this with no internet connection
5. Return to a project days later and all data is preserved
