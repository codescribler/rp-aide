// ==================== TEMPLATE DATA & HELPERS ====================

// Hardcoded default templates — used to seed localStorage on first load
const TEMPLATES = {
  'new-build': {
    name: 'New Build',
    sections: {
      'A': [],
      'B': {
        'Concrete': [
          { desc: '150mm C32/40 RC ground bearing slab with A393 mesh', unit: 'm\u00B2', cost: 120 },
          { desc: '75mm cement screed', unit: 'm\u00B2', cost: 50 },
          { desc: '1200 gauge polythene DPM', unit: 'm\u00B2', cost: 15 },
          { desc: '50mm sand blinding', unit: 'm\u00B2', cost: 30 },
          { desc: '200mm well compacted hardcore', unit: 'm\u00B2', cost: 25 },
          { desc: 'Trench footing 450\u00D7600mm', unit: 'm\u00B3', cost: 600 },
          { desc: 'Trench footing 600\u00D7600mm', unit: 'm\u00B3', cost: 600 },
          { desc: 'Lean concrete fill to DPC level', unit: 'm\u00B2', cost: 25 }
        ],
        'Blockwork': [
          { desc: 'Engineering foundation brickwork outer leaf 100mm', unit: 'm\u00B2', cost: 100 },
          { desc: 'Engineering foundation brickwork inner leaf 100mm', unit: 'm\u00B2', cost: 100 },
          { desc: 'External cavity wall 100mm concrete blocks inner leaf', unit: 'm\u00B2', cost: 45 },
          { desc: '103mm facing brickwork', unit: 'm\u00B2', cost: 120 },
          { desc: '100mm internal block wall half hour fire rated', unit: 'm\u00B2', cost: 45 },
          { desc: 'Padstone 300\u00D7100\u00D7150', unit: 'nr', cost: 250 }
        ],
        'Timber Framing': [
          { desc: '47\u00D7147 C24 floor joists @ 400 c/c', unit: 'm\u00B2', cost: 45 },
          { desc: '47\u00D7125 C24 rafters @ 400 c/c pitched roof', unit: 'm\u00B2', cost: 65 },
          { desc: '22mm chipboard subfloor', unit: 'm\u00B2', cost: 25 },
          { desc: '18mm external grade plywood sheathing flat roof', unit: 'm\u00B2', cost: 25 },
          { desc: 'Ridge beam 2 No. 220\u00D747 C24', unit: 'm', cost: 137.50 },
          { desc: '50\u00D725mm battens pitched roof', unit: 'm\u00B2', cost: 20 }
        ],
        'Metal Framing': [
          { desc: '152\u00D7152\u00D723 UC', unit: 'kg', cost: 5.63 },
          { desc: '203\u00D7102\u00D723 UB', unit: 'kg', cost: 5.63 },
          { desc: 'Base plates 300\u00D7200\u00D712mm S275', unit: 'nr', cost: 150 },
          { desc: 'Catnic BSD100 lintels', unit: 'm', cost: 68.75 },
          { desc: 'Stainless steel wall ties', unit: 'm\u00B2', cost: 15 }
        ]
      },
      'C': {
        'Roofing': [
          { desc: 'GRP finish flat roof', unit: 'm\u00B2', cost: 80 },
          { desc: 'Roof tiles pitched roof', unit: 'm\u00B2', cost: 120 },
          { desc: 'Ridge with ventilated strip and underlay', unit: 'm', cost: 62.50 },
          { desc: 'Rainwater downpipes', unit: 'nr', cost: 162.50 }
        ],
        'Exterior Finish': [
          { desc: 'External wall tiles', unit: 'm\u00B2', cost: 45 },
          { desc: 'Eave fascia board', unit: 'm', cost: 43.75 },
          { desc: 'uPVC guttering', unit: 'm', cost: 31.25 }
        ],
        'Insulation': [
          { desc: '100mm Kingspan TF70 ground floor', unit: 'm\u00B2', cost: 60 },
          { desc: '50mm PIR insulation cavity walls', unit: 'm\u00B2', cost: 50 },
          { desc: '40mm Kingspan Kooltherm K118 pitched roof', unit: 'm\u00B2', cost: 60 },
          { desc: '110mm Kingspan Kooltherm K7 between rafters', unit: 'm\u00B2', cost: 70 }
        ],
        'Doors': [
          { desc: 'External bi-fold door 1300\u00D72100mm', unit: 'nr', cost: 1562.50 },
          { desc: 'External single door 1020\u00D72100mm', unit: 'nr', cost: 1250 },
          { desc: 'Internal single door 838\u00D71961mm', unit: 'nr', cost: 875 },
          { desc: 'Internal single FD30S fire door 838\u00D71961mm', unit: 'nr', cost: 875 },
          { desc: 'Ironmongery', unit: 'nr', cost: 312.50 }
        ],
        'Windows': [
          { desc: 'External window 600\u00D71248mm', unit: 'nr', cost: 437.50 },
          { desc: 'External window 1200\u00D71248mm', unit: 'nr', cost: 875 },
          { desc: 'External window 1800\u00D71330mm', unit: 'nr', cost: 1375 }
        ],
        'Rooflights': [
          { desc: 'Rooflight 1200\u00D7560mm', unit: 'nr', cost: 562.50 }
        ],
        'Plaster Linings': [
          { desc: '12.5mm dot and dab plasterboard', unit: 'm\u00B2', cost: 25 },
          { desc: '12.5mm moisture resistant aquapanel plasterboard wet areas', unit: 'm\u00B2', cost: 25 }
        ],
        'Floor Finishes': [
          { desc: 'Oak flooring', unit: 'm\u00B2', cost: 80 },
          { desc: 'Tile flooring', unit: 'm\u00B2', cost: 110 },
          { desc: 'Level door threshold', unit: 'm', cost: 62.50 }
        ],
        'Wall Finishes': [
          { desc: 'Wall paint 3mm skim + 2 coats emulsion', unit: 'm\u00B2', cost: 45 },
          { desc: 'Wall tile', unit: 'm\u00B2', cost: 120 }
        ],
        'Ceiling Finishes': [
          { desc: '12.5mm suspended plasterboard ceiling 30 min fire rated + skim + emulsion', unit: 'm\u00B2', cost: 65 }
        ],
        'Stairs & Railings': [
          { desc: 'Internal timber stairs 200mm high 950mm wide', unit: 'riser', cost: 562.50 },
          { desc: 'Handrail', unit: 'm', cost: 75 }
        ],
        'Joinery': [
          { desc: '600mm bottom cabinets', unit: 'm', cost: 812.50 },
          { desc: '300mm top cabinets', unit: 'm', cost: 562.50 },
          { desc: 'Kitchen worktop with 4" splashback', unit: 'm\u00B2', cost: 350 }
        ]
      },
      'D': [
        { desc: '110mm above ground drainage pipes uPVC', unit: 'p/s', cost: 7500 },
        { desc: 'Surface water drainage', unit: 'm', cost: 87.50 },
        { desc: 'Foul water drainage', unit: 'm', cost: 137.50 }
      ],
      'E': [
        { desc: 'Bath tub 700\u00D71700mm', unit: 'nr', cost: 812.50 },
        { desc: 'Kitchen sink with faucet', unit: 'nr', cost: 562.50 },
        { desc: 'Toilet commode', unit: 'nr', cost: 562.50 },
        { desc: 'Vanity unit 400\u00D7250mm', unit: 'nr', cost: 687.50 },
        { desc: 'Shower 1300\u00D7800mm', unit: 'nr', cost: 812.50 },
        { desc: '32mm specialist UFH buildup', unit: 'm\u00B2', cost: 60 }
      ],
      'F': [
        { desc: '13 amp double switch socket outlet', unit: 'nr', cost: 137.50 },
        { desc: '13 amp single socket outlet', unit: 'nr', cost: 125 },
        { desc: 'Downlight chrome finish', unit: 'nr', cost: 150 },
        { desc: 'Light switch', unit: 'nr', cost: 112.50 },
        { desc: 'Customer consumer unit', unit: 'nr', cost: 1875 },
        { desc: 'Smoke detector', unit: 'nr', cost: 312.50 },
        { desc: 'Heat detector', unit: 'nr', cost: 312.50 }
      ],
      'G': [
        { desc: 'Concrete sidewalk', unit: 'm\u00B2', cost: 150 },
        { desc: 'Native mixed hedgerow planting', unit: 'm\u00B2', cost: 100 }
      ]
    }
  },
  'extension': {
    name: 'Extension',
    sections: {
      'A': [
        { desc: 'Existing exterior wall to be removed', unit: 'm\u00B2', cost: 58.82 },
        { desc: 'Existing partition wall to be removed', unit: 'm\u00B2', cost: 35.87 },
        { desc: 'Existing boiler to be repositioned', unit: 'item', cost: 1000 },
        { desc: 'Existing roof covering and structure to be removed', unit: 'm\u00B2', cost: 60 },
        { desc: 'Existing flooring to be removed', unit: 'm\u00B2', cost: 20 },
        { desc: 'Existing ceiling to be removed', unit: 'm\u00B2', cost: 15 }
      ],
      'B': {
        'Concrete': [
          { desc: '450\u00D7600mm continuous footing', unit: 'm\u00B3', cost: 450 },
          { desc: 'Excavation', unit: 'm\u00B3', cost: 95 },
          { desc: '75mm concrete slab', unit: 'm\u00B2', cost: 60 },
          { desc: '1200G DPM', unit: 'm\u00B2', cost: 15 }
        ],
        'Blockwork': [
          { desc: 'External wall 100mm PCC block + 100mm cavity', unit: 'm\u00B2', cost: 120 },
          { desc: 'Dwarf exterior wall with cavity insulation', unit: 'm\u00B2', cost: 120 }
        ],
        'Timber Framing': [
          { desc: 'Flat roof joists 150\u00D750 C24 @ 400 c/c', unit: 'm\u00B2', cost: 60 },
          { desc: 'Internal timber stud wall 100\u00D7100 treated @ 400 c/c', unit: 'm\u00B2', cost: 45 },
          { desc: '22mm flooring grade chipboard on joists', unit: 'm\u00B2', cost: 25 },
          { desc: '12.5mm gyproc wallboard and skim plaster', unit: 'm\u00B2', cost: 30 }
        ],
        'Metal Framing': [
          { desc: '152\u00D789 UB16 frame', unit: 'm', cost: 56 },
          { desc: 'Catnic CG/90 lintels', unit: 'm', cost: 50 },
          { desc: 'Stainless steel wall ties', unit: 'p/s', cost: 800 }
        ]
      },
      'C': {
        'Roofing': [
          { desc: 'Fibreglass roofing system flat roof', unit: 'm\u00B2', cost: 60 },
          { desc: 'Aluminium gutter', unit: 'm', cost: 40 },
          { desc: 'Fascia board', unit: 'm', cost: 35 }
        ],
        'Insulation': [
          { desc: '150mm Kingspan Thermaroof flat roof', unit: 'm\u00B2', cost: 80 },
          { desc: '90mm Celotex Thermaclass cavity wall 21', unit: 'm\u00B2', cost: 25 }
        ],
        'Doors': [
          { desc: 'UPVC/aluminium bi-fold door 2300\u00D72200mm', unit: 'nr', cost: 2800 },
          { desc: 'UPVC/aluminium exterior double door 1420\u00D72035mm', unit: 'nr', cost: 1500 },
          { desc: 'Ironmongery', unit: 'nr', cost: 250 }
        ],
        'Windows': [
          { desc: 'UPVC/aluminium double glazed window 1390\u00D71300mm', unit: 'nr', cost: 950 }
        ],
        'Floor Finishes': [
          { desc: 'Suspended timber flooring with LVT', unit: 'm\u00B2', cost: 150 },
          { desc: 'Composite decking', unit: 'm\u00B2', cost: 120 }
        ],
        'Wall Finishes': [
          { desc: 'Wall paint', unit: 'm\u00B2', cost: 35 }
        ],
        'Ceiling Finishes': [
          { desc: 'Ceiling at extended area', unit: 'm\u00B2', cost: 80 }
        ]
      },
      'D': [
        { desc: 'Provisional sum for plumbing work', unit: 'p/s', cost: 4000 }
      ],
      'E': [],
      'F': [
        { desc: 'Provisional sum for electrical work', unit: 'p/s', cost: 5000 }
      ],
      'G': []
    }
  },
  'loft-conversion': {
    name: 'Loft Conversion',
    sections: {
      'A': [
        { desc: 'Remove existing pitched roofing incl. slates/tiles, rafters, plywood, insulation', unit: 'm\u00B2', cost: 55 },
        { desc: 'Remove existing rooflight', unit: 'nr', cost: 100 },
        { desc: 'Remove pitched ceiling first floor if in place', unit: 'p/s', cost: 1000 }
      ],
      'B': {
        'Timber Framing': [
          { desc: '50\u00D7150mm C24 flat roof joist framing', unit: 'm\u00B2', cost: 45 },
          { desc: '50\u00D7150mm C24 loft floor joist framing', unit: 'm\u00B2', cost: 45 },
          { desc: '18mm WBP plywood subflooring', unit: 'm\u00B2', cost: 25 },
          { desc: 'Furring partition wall 47\u00D7100 treated studs @ 400 c/c', unit: 'm\u00B2', cost: 40 },
          { desc: 'Internal partition wall 47\u00D7100 treated studs @ 400 c/c', unit: 'm\u00B2', cost: 40 }
        ]
      },
      'C': {
        'Roofing': [
          { desc: 'Flat roof GRP finish with vapour barrier', unit: 'm\u00B2', cost: 100 },
          { desc: 'Lead/copper flashing', unit: 'm', cost: 50 },
          { desc: 'Roof drain', unit: 'nr', cost: 150 }
        ],
        'Insulation': [
          { desc: '150mm Kingspan Kooltherm roof insulation', unit: 'm\u00B2', cost: 45 },
          { desc: '100mm Kingspan Kooltherm floor insulation', unit: 'm\u00B2', cost: 40 },
          { desc: 'Rockwool batt insulation inside stud cavity', unit: 'm\u00B2', cost: 25 }
        ],
        'Doors': [
          { desc: 'Internal single door painted solid core 762\u00D72100mm', unit: 'nr', cost: 650 },
          { desc: 'Ironmongery', unit: 'nr', cost: 250 }
        ],
        'Rooflights': [
          { desc: 'Rooflight 800\u00D7700mm', unit: 'nr', cost: 350 }
        ],
        'Plaster Linings': [
          { desc: '12.5mm plasterboard on studwork', unit: 'm\u00B2', cost: 25 },
          { desc: '12.5mm Wediboard in wet areas', unit: 'm\u00B2', cost: 30 }
        ],
        'Floor Finishes': [
          { desc: 'Oak flooring', unit: 'm\u00B2', cost: 90 },
          { desc: 'Tile flooring', unit: 'm\u00B2', cost: 100 }
        ],
        'Wall Finishes': [
          { desc: 'Wall paint 3mm skim + 2 coats emulsion', unit: 'm\u00B2', cost: 45 },
          { desc: 'Wall tile', unit: 'm\u00B2', cost: 120 }
        ],
        'Ceiling Finishes': [
          { desc: '12.5mm suspended plasterboard ceiling + skim + emulsion', unit: 'm\u00B2', cost: 45 }
        ],
        'Stairs & Railings': [
          { desc: 'Internal timber stairs 800mm wide + 1 landing step', unit: 'riser', cost: 350 },
          { desc: 'Stair handrail', unit: 'm', cost: 200 },
          { desc: 'Stair railing', unit: 'm', cost: 450 }
        ]
      },
      'D': [
        { desc: 'Bath tub 1700\u00D7750mm', unit: 'nr', cost: 450 },
        { desc: 'Shower pan curved 800\u00D7800mm', unit: 'nr', cost: 650 },
        { desc: 'Water closet', unit: 'nr', cost: 350 },
        { desc: 'Handbasin', unit: 'nr', cost: 350 },
        { desc: 'Misc piping', unit: 'p/s', cost: 2000 }
      ],
      'E': [
        { desc: 'Electrical works', unit: 'p/s', cost: 3000 }
      ],
      'F': [
        { desc: 'Mechanical works', unit: 'p/s', cost: 2000 }
      ],
      'G': []
    }
  },
  'garage-conversion': {
    name: 'Garage Conversion',
    sections: {
      'A': [
        { desc: 'Existing internal stud wall to be removed', unit: 'm\u00B2', cost: 35 },
        { desc: 'Existing external double door to be removed', unit: 'nr', cost: 120 },
        { desc: 'Existing floor finish to be removed', unit: 'm\u00B2', cost: 20 },
        { desc: 'Existing roof with assembly to be removed', unit: 'm\u00B2', cost: 60 }
      ],
      'B': {
        'Blockwork': [
          { desc: 'External block wall 100mm double skin with cavity insulation', unit: 'm\u00B2', cost: 120 }
        ],
        'Timber Framing': [
          { desc: '50\u00D7150mm C24 roof joists @ 400 c/c', unit: 'm\u00B2', cost: 55 },
          { desc: '125mm internal stud wall 47\u00D7100 treated studs @ 400 c/c', unit: 'm\u00B2', cost: 45 },
          { desc: '22mm plywood subfloor', unit: 'm\u00B2', cost: 25 },
          { desc: '18mm marine roof plywood', unit: 'm\u00B2', cost: 25 }
        ]
      },
      'C': {
        'Roofing': [
          { desc: 'Single membrane cold flat roof', unit: 'm\u00B2', cost: 80 },
          { desc: 'uPVC gutter', unit: 'm', cost: 35 }
        ],
        'Insulation': [
          { desc: '100mm Kooltherm cavity walls', unit: 'm\u00B2', cost: 40 },
          { desc: '100mm Celotex GA4000 roof', unit: 'm\u00B2', cost: 45 }
        ],
        'Doors': [
          { desc: 'External double swing door 1200\u00D72100mm', unit: 'nr', cost: 1400 },
          { desc: 'Internal single swing door 800\u00D72100mm', unit: 'nr', cost: 650 },
          { desc: 'Ironmongery', unit: 'nr', cost: 250 }
        ],
        'Windows': [
          { desc: 'External window 900\u00D71050mm', unit: 'nr', cost: 550 },
          { desc: 'External window 1800\u00D71050mm', unit: 'nr', cost: 950 }
        ],
        'Plaster Linings': [
          { desc: '12.5mm plasterboard on stud walls and blockwork', unit: 'm\u00B2', cost: 25 }
        ],
        'Floor Finishes': [
          { desc: 'Wood flooring', unit: 'm\u00B2', cost: 80 },
          { desc: 'Tile flooring', unit: 'm\u00B2', cost: 100 }
        ],
        'Wall Finishes': [
          { desc: 'Wall paint 3mm skim + 2 coats emulsion', unit: 'm\u00B2', cost: 45 }
        ],
        'Ceiling Finishes': [
          { desc: '12.5mm plasterboard ceiling with skim finish', unit: 'm\u00B2', cost: 55 }
        ]
      },
      'D': [
        { desc: 'Sink with faucet', unit: 'nr', cost: 400 },
        { desc: 'Water closet', unit: 'nr', cost: 350 }
      ],
      'E': [
        { desc: 'Electrical works allowance', unit: 'p/s', cost: 4000 }
      ],
      'F': [],
      'G': []
    }
  },
  'kitchen-refit': {
    name: 'Kitchen Refit',
    sections: {
      'A': [
        { desc: 'Existing kitchen island to be removed', unit: 'item', cost: 300 },
        { desc: 'Existing countertop to be removed', unit: 'm\u00B2', cost: 30 },
        { desc: 'Existing bottom cabinets to be removed', unit: 'm', cost: 30 },
        { desc: 'Existing top cabinets to be removed', unit: 'm', cost: 30 },
        { desc: 'Existing sink with faucet to be removed', unit: 'nr', cost: 50 },
        { desc: 'Existing flooring to be removed', unit: 'm\u00B2', cost: 20 },
        { desc: 'Existing wall tiles to be removed', unit: 'm\u00B2', cost: 25 }
      ],
      'B': {
        'Timber Framing': [
          { desc: 'Internal timber stud wall 100\u00D7100 treated @ 400 c/c', unit: 'm\u00B2', cost: 45 },
          { desc: '12.5mm gyproc wallboard and skim plaster', unit: 'm\u00B2', cost: 30 }
        ],
        'Metal Framing': [
          { desc: 'Catnic lintel over new opening', unit: 'm', cost: 68.75 },
          { desc: 'Steel beam for knock-through', unit: 'kg', cost: 5.63 }
        ]
      },
      'C': {
        'Doors': [
          { desc: 'Internal single door', unit: 'nr', cost: 875 },
          { desc: 'Ironmongery', unit: 'nr', cost: 250 }
        ],
        'Floor Finishes': [
          { desc: 'Tile flooring', unit: 'm\u00B2', cost: 110 },
          { desc: 'LVT flooring', unit: 'm\u00B2', cost: 75 }
        ],
        'Wall Finishes': [
          { desc: 'Wall paint 3mm skim + 2 coats emulsion', unit: 'm\u00B2', cost: 45 },
          { desc: 'Wall tile splashback', unit: 'm\u00B2', cost: 120 }
        ],
        'Ceiling Finishes': [
          { desc: '12.5mm plasterboard ceiling + skim + emulsion', unit: 'm\u00B2', cost: 65 }
        ],
        'Joinery': [
          { desc: '600mm bottom cabinets', unit: 'm', cost: 812.50 },
          { desc: '300mm top cabinets', unit: 'm', cost: 562.50 },
          { desc: 'Kitchen worktop with 4" splashback', unit: 'm\u00B2', cost: 350 },
          { desc: 'Kitchen island', unit: 'nr', cost: 1250 }
        ]
      },
      'D': [],
      'E': [
        { desc: 'Kitchen sink with faucet', unit: 'nr', cost: 562.50 },
        { desc: 'Extractor/cooker hood ducting', unit: 'item', cost: 300 }
      ],
      'F': [
        { desc: '13 amp double switch socket outlet', unit: 'nr', cost: 137.50 },
        { desc: 'Downlight chrome finish', unit: 'nr', cost: 150 },
        { desc: 'Light switch', unit: 'nr', cost: 112.50 }
      ],
      'G': []
    }
  },
  'bathroom-refit': {
    name: 'Bathroom Refit',
    sections: {
      'A': [
        { desc: 'Existing bath tub to be removed', unit: 'nr', cost: 80 },
        { desc: 'Existing shower to be removed', unit: 'nr', cost: 80 },
        { desc: 'Existing WC to be removed', unit: 'nr', cost: 50 },
        { desc: 'Existing handbasin/vanity to be removed', unit: 'nr', cost: 50 },
        { desc: 'Existing wall tiles to be removed', unit: 'm\u00B2', cost: 25 },
        { desc: 'Existing floor tiles to be removed', unit: 'm\u00B2', cost: 25 }
      ],
      'B': {
        'Timber Framing': [
          { desc: 'Internal stud wall for en-suite partition', unit: 'm\u00B2', cost: 40 },
          { desc: 'Stud wall headboard/screen', unit: 'm\u00B2', cost: 35 }
        ]
      },
      'C': {
        'Insulation': [
          { desc: 'Acoustic rockwool batt in stud walls', unit: 'm\u00B2', cost: 25 }
        ],
        'Doors': [
          { desc: 'Internal single door', unit: 'nr', cost: 875 },
          { desc: 'Ironmongery', unit: 'nr', cost: 250 }
        ],
        'Plaster Linings': [
          { desc: '12.5mm moisture resistant aquapanel plasterboard', unit: 'm\u00B2', cost: 25 },
          { desc: '12.5mm Wediboard attached to tilework wet areas', unit: 'm\u00B2', cost: 30 }
        ],
        'Floor Finishes': [
          { desc: 'Tile flooring', unit: 'm\u00B2', cost: 100 }
        ],
        'Wall Finishes': [
          { desc: 'Wall tile', unit: 'm\u00B2', cost: 120 }
        ],
        'Ceiling Finishes': [
          { desc: '12.5mm plasterboard ceiling + skim + emulsion', unit: 'm\u00B2', cost: 65 }
        ]
      },
      'D': [],
      'E': [
        { desc: 'Bath tub 700\u00D71700mm', unit: 'nr', cost: 812.50 },
        { desc: 'Shower 1300\u00D7800mm', unit: 'nr', cost: 812.50 },
        { desc: 'Water closet', unit: 'nr', cost: 562.50 },
        { desc: 'Vanity unit 400\u00D7250mm', unit: 'nr', cost: 687.50 },
        { desc: 'Misc piping', unit: 'p/s', cost: 2000 }
      ],
      'F': [
        { desc: 'Shaver socket', unit: 'nr', cost: 150 },
        { desc: 'Electrical towel rail switched fused spur', unit: 'nr', cost: 250 },
        { desc: 'Moisture resistant bathroom lighting', unit: 'nr', cost: 162.50 },
        { desc: 'Downlight chrome finish', unit: 'nr', cost: 150 },
        { desc: 'Extractor fan', unit: 'nr', cost: 150 }
      ],
      'G': []
    }
  }
};


// ==================== TEMPLATE LOCALSTORAGE HELPERS ====================

function getTemplates() {
  const raw = localStorage.getItem('rp_templates');
  return raw ? JSON.parse(raw) : null;
}

function saveTemplates(templates) {
  localStorage.setItem('rp_templates', JSON.stringify(templates));
}

function initTemplates() {
  if (getTemplates()) return;
  // Seed from hardcoded defaults, augmenting each item with enabled + relatedCosts
  const seeded = JSON.parse(JSON.stringify(TEMPLATES));
  for (const typeKey of Object.keys(seeded)) {
    const sections = seeded[typeKey].sections;
    for (const secKey of Object.keys(sections)) {
      const secData = sections[secKey];
      if (Array.isArray(secData)) {
        secData.forEach(item => {
          item.enabled = true;
          item.relatedCosts = '';
        });
      } else if (secData && typeof secData === 'object') {
        for (const subKey of Object.keys(secData)) {
          secData[subKey].forEach(item => {
            item.enabled = true;
            item.relatedCosts = '';
          });
        }
      }
    }
  }
  saveTemplates(seeded);
}
