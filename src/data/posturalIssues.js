const posturalIssues = [
  {
    id: 'rounded_shoulders',
    name: 'Rounded Shoulders',
    category: 'Upper Body',
    icon: '🔄',
    severity: 'common',
    timeline: '4-8 weeks',
    targetSessionsDefault: 30,
    causes: [
      'Prolonged sitting and desk work',
      'Overtraining chest without enough back work',
      'Excessive phone usage with forward slouching'
    ],
    diagnostics: [
      {
        name: 'The Wall Test',
        description: 'Stand with your back flat against a wall. If your shoulder blades and the back of your head do not naturally touch the wall without arching your lower back, you have rounded shoulders.',
        steps: [
          'Stand with heels, glutes, and upper back touching a wall.',
          'Try to place the back of your shoulders and your head flat against the wall.',
          'If you must arch your lower back excessively to do this, the test is positive.'
        ],
        externalLink: 'https://www.healthline.com/health/posture-exercises#wall-angels'
      },
      {
        name: 'Hand/Thumb Check',
        description: 'Stand naturally and look at your hands. If your thumbs point toward each other (internal rotation) rather than straight forward, your shoulders are rounded forward.',
        steps: [
          'Stand tall in your normal, relaxed posture.',
          'Look down at the direction your palms and thumbs are facing.',
          'If palms face backwards and thumbs point inward, your shoulders are slouched.'
        ],
        externalLink: 'https://www.nasm.org/resources/posture-correction'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10003, name: 'Doorway Pec Stretch', sets: 2, reps: '30s hold', notes: 'Keep elbows at 90 degrees; lean forward gently.' },
      { exerciseId: 203, name: 'Face Pull', sets: 3, reps: '15 reps', notes: 'Squeeze shoulder blades together and externally rotate at the top.' },
      { exerciseId: 10001, name: 'Wall Angel', sets: 2, reps: '12 reps', notes: 'Keep head, spine, elbows, and hands flat against the wall.' }
    ]
  },
  {
    id: 'tech_neck',
    name: 'Tech Neck / Text Neck',
    category: 'Upper Body',
    icon: '📱',
    severity: 'common',
    timeline: '4-6 weeks',
    targetSessionsDefault: 30,
    causes: [
      'Staring down at phones or tablets for long durations',
      'Improper monitor height at work',
      'Weak deep neck flexor muscles'
    ],
    diagnostics: [
      {
        name: 'Ear-to-Shoulder Alignment',
        description: 'Have someone take a side-profile picture of you standing naturally. Check if the center of your ear sits directly over the center of your shoulder.',
        steps: [
          'Stand relaxed in your normal posture.',
          'Observe your side-profile alignment.',
          'If your ear is more than an inch forward of your shoulder bony landmark, you have tech neck.'
        ],
        externalLink: 'https://www.spine-health.com/blog/how-know-if-you-have-forward-head-posture'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10009, name: 'Levator Scapulae Stretch', sets: 2, reps: '30s hold', notes: 'Look down toward your armpit; apply light pressure with your hand.' },
      { exerciseId: 10002, name: 'Chin Tuck', sets: 3, reps: '10 reps', notes: 'Pull chin straight back to create a double chin. Hold 5s.' },
      { exerciseId: 10003, name: 'Doorway Pec Stretch', sets: 2, reps: '30s hold', notes: 'Stretch chest muscles to reverse forward hunching.' }
    ]
  },
  {
    id: 'forward_head_posture',
    name: 'Forward Head Posture',
    category: 'Upper Body',
    icon: '🗣️',
    severity: 'moderate',
    timeline: '6-8 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Chronic forward slouching',
      'Weak deep stabilizers of the cervical spine',
      'Tightness in the suboccipital and upper trap muscles'
    ],
    diagnostics: [
      {
        name: 'The Chin Tuck Resistance',
        description: 'Attempt to pull your head straight back. If it feels extremely tight at the base of the skull or you cannot pull it back past your collarbone, your forward head posture is moderate.',
        steps: [
          'Sit tall, pull your shoulder blades down.',
          'Pull your chin straight back as far as possible.',
          'Assess tightness at the base of the skull.'
        ],
        externalLink: 'https://www.healthline.com/health/forward-head-posture'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10009, name: 'Levator Scapulae Stretch', sets: 2, reps: '30s hold', notes: 'Gently pull diagonally forward and down.' },
      { exerciseId: 10002, name: 'Chin Tuck', sets: 3, reps: '12 reps', notes: 'Hold for 5s at peak retraction.' },
      { exerciseId: 10008, name: 'Deep Neck Flexor Hold', sets: 2, reps: '15s hold', notes: 'Lift head 1 inch off floor with chin tucked.' }
    ]
  },
  {
    id: 'anterior_pelvic_tilt',
    name: 'Anterior Pelvic Tilt',
    category: 'Lower Body',
    icon: '🍑',
    severity: 'common',
    timeline: '8-12 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Excessive sitting causing tight hip flexors',
      'Weak glutes and core muscles',
      'Poor standing ergonomics (hanging on the lower back)'
    ],
    diagnostics: [
      {
        name: 'Thomas Test',
        description: 'Sit at the very edge of a sturdy table. Hug one knee tightly to your chest and lie back flat on the table, letting the other leg hang down. If your hanging thigh lifts above horizontal, your hip flexors are tight, indicating APT.',
        steps: [
          'Sit on edge of bed or table, hug one knee to chest.',
          'Lie back flat on the table.',
          'If the free leg cannot lay flat or hang below horizontal, the test is positive.'
        ],
        externalLink: 'https://www.physiopedia.com/Thomas_Test'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10004, name: 'Kneeling Hip Flexor Stretch', sets: 2, reps: '30s hold', notes: 'Squeeze the glute on the trailing leg to maximize hip flexor stretch.' },
      { exerciseId: 3013, name: 'Glute Bridge', sets: 3, reps: '15 reps', notes: 'Drive through heels, squeeze glutes at top; do not arch lower back.' },
      { exerciseId: 276, name: 'Dead Bug', sets: 3, reps: '10 per side', notes: 'Keep your lower back absolutely flat against the floor.' }
    ]
  },
  {
    id: 'posterior_pelvic_tilt',
    name: 'Posterior Pelvic Tilt',
    category: 'Lower Body',
    icon: '🧘',
    severity: 'moderate',
    timeline: '8-12 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Tight hamstrings and glutes pulling pelvis down',
      'Weak hip flexors and lower back stabilizers',
      'Slouched sitting on the tailbone'
    ],
    diagnostics: [
      {
        name: 'Flat Back Test',
        description: 'Stand with your back against a wall. If your lower back is completely flat against the wall with no gap (you cannot slide your hand behind your lower back), you likely have posterior pelvic tilt.',
        steps: [
          'Stand relaxed with heels and upper back against a wall.',
          'Try to slide your flat hand behind your lower back.',
          'If there is no space for your hand, your pelvis is tilted posteriorly.'
        ],
        externalLink: 'https://www.nasm.org/blog/posterior-pelvic-tilt'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10010, name: 'Standing Hamstring Stretch', sets: 2, reps: '30s hold', notes: 'Hinge at the hips with a flat back; do not round your spine.' },
      { exerciseId: 10004, name: 'Kneeling Hip Flexor Stretch', sets: 3, reps: '12 reps', notes: 'Instead of holding, perform dynamic repetitions pushing hips forward.' },
      { exerciseId: 10021, name: 'Bird Dog', sets: 3, reps: '10 per side', notes: 'Extend opposite arm/leg while keeping spine neutral.' }
    ]
  },
  {
    id: 'knee_valgus',
    name: 'Knee Valgus (Knock Knees)',
    category: 'Lower Body',
    icon: '🦵',
    severity: 'moderate',
    timeline: '8-12 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Weak gluteus medius and hip abductors',
      'Flat feet or poor ankle mobility',
      'Poor neuromuscular control during squats/jumps'
    ],
    diagnostics: [
      {
        name: 'Single Leg Squat Test',
        description: 'Perform a single-leg squat in front of a mirror. If your knee caves inward across the midline of your foot, you have knee valgus.',
        steps: [
          'Stand on one leg facing a mirror.',
          'Perform a shallow single-leg squat.',
          'Watch if the knee travels inward relative to the toes.'
        ],
        externalLink: 'https://www.nasm.org/resources/overhead-squat-assessment'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10005, name: 'Clamshell', sets: 3, reps: '15 reps', notes: 'Lie on side; lift knee while keeping feet together and hips stable.' },
      { exerciseId: 10011, name: 'Lateral Band Walk', sets: 2, reps: '15 steps', notes: 'Place band around ankles; walk sideways keeping knees pushed apart.' },
      { exerciseId: 3013, name: 'Glute Bridge', sets: 3, reps: '15 reps', notes: 'Push knees outward against a band if possible.' }
    ]
  },
  {
    id: 'it_band_tightness',
    name: 'IT Band Tightness / Friction',
    category: 'Lower Body',
    icon: '🩹',
    severity: 'common',
    timeline: '6-8 weeks',
    targetSessionsDefault: 30,
    causes: [
      'Repetitive running or cycling with poor hip stability',
      'Weak gluteus medius causing tension on the tensor fasciae latae (TFL)',
      'Lack of soft tissue mobility'
    ],
    diagnostics: [
      {
        name: 'Obers Test',
        description: 'Lie on your side. Have a partner lift your top leg, bend your knee to 90 degrees, pull your hip back, and slowly lower the leg. If the leg remains hovering in the air and cannot drop below horizontal, your IT band/TFL is tight.',
        steps: [
          'Lie on side with bottom leg bent for stability.',
          'Top leg is bent at the knee, pulled slightly back by a partner.',
          'Partner releases leg; if it stays elevated, it is positive.'
        ],
        externalLink: 'https://www.physiopedia.com/Obers_Test'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10012, name: 'IT Band Foam Roll', sets: 1, reps: '60s hold', notes: 'Roll outer thigh slowly; pause on tender spots.' },
      { exerciseId: 10023, name: 'Pigeon Pose', sets: 2, reps: '30s hold', notes: 'Stretch glutes and outer hips deeply.' },
      { exerciseId: 10013, name: 'Side-Lying Leg Raise', sets: 3, reps: '15 reps', notes: 'Raise leg slightly up and back to activate gluteus medius.' }
    ]
  },
  {
    id: 'flat_feet',
    name: 'Flat Feet / Overpronation',
    category: 'Lower Body',
    icon: '👣',
    severity: 'moderate',
    timeline: '8-12 weeks',
    targetSessionsDefault: 90,
    causes: [
      'Weak intrinsic foot arch muscles',
      'Tight calf muscles (gastrocnemius/soleus)',
      'Structural predisposition or poor footwear'
    ],
    diagnostics: [
      {
        name: 'Wet Footprint Test',
        description: 'Wet the bottom of your foot and step onto a piece of cardboard. If the footprint shows the entire sole of your foot with almost no curve on the inner edge, your arches are flat.',
        steps: [
          'Wet bottom of foot.',
          'Step onto dark paper or dry concrete.',
          'Analyze the width of the middle foot bridge.'
        ],
        externalLink: 'https://www.healthline.com/health/flat-feet-exercises'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10014, name: 'Towel Foot Scrunch', sets: 2, reps: '10 reps', notes: 'Use toes to pull a towel flat along the floor.' },
      { exerciseId: 10015, name: 'Short Foot Arch Lift', sets: 3, reps: '10 reps', notes: 'Draw the ball of your foot toward the heel to lift the arch.' },
      { exerciseId: 1490, name: 'Calf Raise (Standing)', sets: 2, reps: '15 reps', notes: 'Full range of motion, stretching calves at the bottom.' }
    ]
  },
  {
    id: 'upper_cross_syndrome',
    name: 'Upper Cross Syndrome',
    category: 'Upper Body',
    icon: '✖️',
    severity: 'severe',
    timeline: '8-12 weeks',
    targetSessionsDefault: 90,
    causes: [
      'Chronic poor desk posture over years',
      'Combination of tight chest/upper neck + weak mid-back/deep neck flexors',
      'Joint dysfunction in the cervical/thoracic spine'
    ],
    diagnostics: [
      {
        name: 'Double-Cross Hunch Check',
        description: 'Observe posture from the side. Look for the combination of forward head posture, slouched shoulders, and rounded upper back. Tapping the upper traps will reveal severe tightness/pain.',
        steps: [
          'Stand relaxed.',
          'Assess forward neck distance AND shoulder rotation simultaneously.',
          'If both are present, it is Upper Cross Syndrome.'
        ],
        externalLink: 'https://www.nasm.org/blog/corrective-exercise-for-upper-crossed-syndrome'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10003, name: 'Doorway Pec Stretch', sets: 2, reps: '30s hold', notes: 'Relieve chest tightness that pulls shoulders forward.' },
      { exerciseId: 10002, name: 'Chin Tuck', sets: 3, reps: '10 reps', notes: 'Activate deep cervical flexors.' },
      { exerciseId: 10018, name: 'Band Pull-Apart', sets: 3, reps: '15 reps', notes: 'Strengthen weak rhomboids and middle traps.' }
    ]
  },
  {
    id: 'lower_cross_syndrome',
    name: 'Lower Cross Syndrome',
    category: 'Lower Body',
    icon: '🚼',
    severity: 'severe',
    timeline: '8-12 weeks',
    targetSessionsDefault: 90,
    causes: [
      'Years of sedentary desk habits',
      'Tight hip flexors and lower back erectors + weak abs and glutes',
      'Leads to excessive lumbar lordosis (swayback)'
    ],
    diagnostics: [
      {
        name: 'Swayback Pain Check',
        description: 'Lie flat on the floor. If you cannot press your lower back completely flat against the floor even when bending your knees slightly, your lumbar spine is locked in lordosis.',
        steps: [
          'Lie on back with legs straight.',
          'Try to slide your hand under your lower back; if a large gap exists, tilt is severe.',
          'Flatten lower back; assess difficulty.'
        ],
        externalLink: 'https://www.nasm.org/blog/lower-crossed-syndrome'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10006, name: 'Couch Stretch', sets: 2, reps: '30s hold', notes: 'Deeply stretch the tight psoas and rectus femoris.' },
      { exerciseId: 3013, name: 'Glute Bridge', sets: 3, reps: '15 reps', notes: 'Awaken dormant glute muscles.' },
      { exerciseId: 10024, name: 'Plank', sets: 3, reps: '45s hold', notes: 'Brace core; keep lower back flat, avoiding sag.' }
    ]
  },
  {
    id: 'winged_scapula',
    name: 'Winged Scapula',
    category: 'Upper Body',
    icon: '🦅',
    severity: 'moderate',
    timeline: '6-8 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Weak serratus anterior muscle',
      'Poor control of the scapulothoracic joint',
      'Tight pec minor pulling the shoulder blade forward'
    ],
    diagnostics: [
      {
        name: 'Wall Push Test',
        description: 'Stand arms-length away from a wall. Place hands flat and push hard against the wall. Have someone observe your back. If the inner edge of your shoulder blade protrudes outward like a wing, the test is positive.',
        steps: [
          'Face a wall, arms straight, hands flat.',
          'Lean in and push away forcefully.',
          'Observe if the shoulder blade lifts off the rib cage.'
        ],
        externalLink: 'https://www.healthline.com/health/winged-scapula'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10007, name: 'Serratus Push-Up+', sets: 3, reps: '12 reps', notes: 'Focus entirely on push-away at the top of the range.' },
      { exerciseId: 10020, name: 'Scapular Wall Slide', sets: 3, reps: '10 reps', notes: 'Keep elbows and wrists touching the wall throughout.' },
      { exerciseId: 652, name: 'Pull-Up', sets: 2, reps: '10 reps', notes: 'Perform only the first few inches (scapular shrugs) to pull shoulders down.' }
    ]
  },
  {
    id: 'thoracic_kyphosis',
    name: 'Thoracic Kyphosis (Hunchback)',
    category: 'Spine',
    icon: '🐪',
    severity: 'moderate',
    timeline: '6-10 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Chronic slouched sitting and head-forward posture',
      'Stiffness in the thoracic vertebrae joints',
      'Weak spinal erector muscles'
    ],
    diagnostics: [
      {
        name: 'Thoracic Extension Check',
        description: 'Kneel in front of a chair or bench. Place elbows on the bench, hold a stick, and drop your head and chest down. If your upper back remains humped and cannot flatten, thoracic extension is restricted.',
        steps: [
          'Kneel, place elbows on bench.',
          'Lower head and chest towards floor.',
          'If upper back remains curved upward, joint stiffness is high.'
        ],
        externalLink: 'https://www.nasm.org/blog/how-to-fix-hunchback-posture'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10016, name: 'Thoracic Roller Extension', sets: 2, reps: '10 reps', notes: 'Support your neck; roll and extend upper back over the roller.' },
      { exerciseId: 10022, name: 'Cat-Cow', sets: 2, reps: '12 reps', notes: 'Move spine smoothly through full flexion and extension.' },
      { exerciseId: 10018, name: 'Band Pull-Apart', sets: 3, reps: '15 reps', notes: 'Strengthen erectors and upper back retractors.' }
    ]
  },
  {
    id: 'lateral_pelvic_tilt',
    name: 'Lateral Pelvic Tilt',
    category: 'Lower Body',
    icon: '⚖️',
    severity: 'moderate',
    timeline: '8-12 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Unequal weight bearing (leaning on one leg always)',
      'Tight quadratus lumborum (QL) on one side + weak gluteus medius',
      'Leg length discrepancy (functional or structural)'
    ],
    diagnostics: [
      {
        name: 'Adductions/Abductions Level Test',
        description: 'Stand in front of a mirror and place hands on your hip bones. Observe if one hand is higher than the other. If one hip sits visibly higher, you have lateral tilt.',
        steps: [
          'Stand relaxed facing a mirror with feet straight.',
          'Place your index fingers on top of your hip bones (ASIS).',
          'Check if the line between your fingers is horizontal.'
        ],
        externalLink: 'https://www.nasm.org/blog/lateral-pelvic-tilt-causes-and-corrections'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10017, name: 'Single-Leg Balance', sets: 3, reps: '30s hold', notes: 'Ensure hips remain perfectly level; do not let hip drop.' },
      { exerciseId: 10005, name: 'Clamshell', sets: 3, reps: '12 reps', notes: 'Perform on the weak side to balance hip stabilizers.' },
      { exerciseId: 705, name: 'Side Plank', sets: 2, reps: '30s hold', notes: 'Perform on both sides; focus on keeping body in a straight line.' }
    ]
  },
  {
    id: 'tight_hip_flexors',
    name: 'Tight Hip Flexors',
    category: 'Lower Body',
    icon: '🔓',
    severity: 'common',
    timeline: '4-6 weeks',
    targetSessionsDefault: 30,
    causes: [
      'Sitting for more than 6 hours per day',
      'Lack of hip extension training',
      'Inadequate stretching routines after workouts'
    ],
    diagnostics: [
      {
        name: 'Lunge Extension Test',
        description: 'Take a deep lunge step forward. If you cannot bring your back leg fully straight behind you without arching your lower back, your hip flexors are tight.',
        steps: [
          'Perform a deep kneeling lunge.',
          'Try to push your pelvis forward while keeping spine upright.',
          'Assess tightness in front of hip.'
        ],
        externalLink: 'https://www.healthline.com/health/hip-flexor-stretches'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10004, name: 'Kneeling Hip Flexor Stretch', sets: 2, reps: '30s hold', notes: 'Tilt pelvis backward slightly to isolate hip flexor.' },
      { exerciseId: 10006, name: 'Couch Stretch', sets: 2, reps: '30s hold', notes: 'Intense stretch; hold upright posture as much as possible.' },
      { exerciseId: 10021, name: 'Bird Dog', sets: 3, reps: '10 per side', notes: 'Strengthen back chain dynamically.' }
    ]
  },
  {
    id: 'shoulder_impingement_prehab',
    name: 'Shoulder Impingement (Prehab)',
    category: 'Upper Body',
    icon: '🛡️',
    severity: 'moderate',
    timeline: '6-8 weeks',
    targetSessionsDefault: 60,
    causes: [
      'Tight chest and front shoulder structures',
      'Weak rotator cuff muscles (external rotators)',
      'Poor scapular mobility during overhead movements'
    ],
    diagnostics: [
      {
        name: 'Neers Test',
        description: 'Have a partner raise your arm straight up next to your ear while keeping your palm facing away. If you feel sharp pain at the front/side of your shoulder near the top, the test is positive.',
        steps: [
          'Stand relaxed, arm by side, palm rotated outward.',
          'Partner raises your arm fully overhead.',
          'Check for compression discomfort at top.'
        ],
        externalLink: 'https://www.physiopedia.com/Neers_Test'
      }
    ],
    correctiveProtocol: [
      { exerciseId: 10019, name: 'Band External Rotation', sets: 3, reps: '15 reps', notes: 'Keep elbows tucked into sides.' },
      { exerciseId: 10018, name: 'Band Pull-Apart', sets: 3, reps: '15 reps', notes: 'Retract scapula; pull band to chest.' },
      { exerciseId: 10003, name: 'Doorway Pec Stretch', sets: 2, reps: '30s hold', notes: 'Relieve front-side tightness.' }
    ]
  }
];

export default posturalIssues;
export const categories = ['All', 'Upper Body', 'Lower Body', 'Spine'];
