// Corrective / mobility exercises that the main dataset doesn't include.
// IDs live in a reserved range (10001+) that the dataset never uses; posturalIssues.js references them.
export const CORRECTIVE_ID_START = 10001;

const c = (id, name, target, equipment, instructions) => ({
  id,
  name,
  muscleGroup: 'Corrective',
  bodyPart: 'corrective',
  target,
  equipment,
  isCorrective: true,
  instructions,
});

export const correctiveExercises = [
  c(10001, 'Wall Angel', 'upper back', 'body weight', [
    'Stand with heels, glutes, upper back and head against a wall.',
    'Raise your arms to a goalpost position with elbows and wrists touching the wall.',
    'Slowly slide your arms overhead while keeping contact with the wall.',
    'Lower back to the start and repeat without arching your lower back.',
  ]),
  c(10002, 'Chin Tuck', 'neck', 'body weight', [
    'Sit or stand tall and look straight ahead.',
    'Glide your chin straight back, making a "double chin", without tilting your head.',
    'Hold for 5 seconds, then relax.',
  ]),
  c(10003, 'Doorway Pec Stretch', 'chest', 'body weight', [
    'Stand in a doorway with forearms on the frame, elbows at shoulder height and 90 degrees.',
    'Step one foot forward and gently lean through until you feel a stretch across the chest.',
    'Hold, breathing slowly, then step back.',
  ]),
  c(10004, 'Kneeling Hip Flexor Stretch', 'hip flexors', 'body weight', [
    'Kneel on one knee with the other foot flat in front, both knees at 90 degrees.',
    'Squeeze the glute of the kneeling leg and tuck your pelvis under.',
    'Shift forward slightly until you feel a stretch at the front of the hip. Hold, then switch sides.',
  ]),
  c(10005, 'Clamshell', 'glutes', 'band', [
    'Lie on your side with hips and knees bent, feet together, band above the knees.',
    'Keeping feet together and hips stacked, lift the top knee as high as you can without rolling back.',
    'Pause, lower with control, and complete all reps before switching sides.',
  ]),
  c(10006, 'Couch Stretch', 'quads', 'body weight', [
    'Kneel with your back foot up against a wall or couch, shin vertical.',
    'Bring the other foot forward into a half-kneeling position.',
    'Squeeze the back glute and lift your torso upright until you feel a deep quad and hip stretch. Hold, then switch.',
  ]),
  c(10007, 'Serratus Push-Up+', 'serratus anterior', 'body weight', [
    'Start in a high plank with arms straight.',
    'Do a normal push-up, and at the top push the floor further away, spreading your shoulder blades apart.',
    'Pause at the top, then repeat.',
  ]),
  c(10008, 'Deep Neck Flexor Hold', 'neck', 'body weight', [
    'Lie on your back with knees bent.',
    'Tuck your chin gently, then lift your head about 2 cm off the floor.',
    'Hold while breathing normally; stop before your chin pokes forward.',
  ]),
  c(10009, 'Levator Scapulae Stretch', 'neck', 'body weight', [
    'Sit tall and hold the edge of the seat with one hand.',
    'Turn your head 45 degrees away from that side and look down toward your armpit.',
    'Use the other hand to apply gentle pressure. Hold, then switch.',
  ]),
  c(10010, 'Standing Hamstring Stretch', 'hamstrings', 'body weight', [
    'Place one heel on a low step with the leg straight.',
    'Keep your back flat and hinge forward from the hips until you feel the stretch behind the thigh.',
    'Hold, then switch sides.',
  ]),
  c(10011, 'Lateral Band Walk', 'glutes', 'band', [
    'Place a band above the knees or around the ankles and sit into a quarter squat.',
    'Step sideways, keeping tension in the band and toes pointing forward.',
    'Take the planned number of steps, then return the other way.',
  ]),
  c(10012, 'IT Band Foam Roll', 'outer thigh', 'foam roller', [
    'Lie on your side with a foam roller under the outer thigh.',
    'Support yourself with your arms and top leg.',
    'Roll slowly from hip to just above the knee, pausing on tender spots.',
  ]),
  c(10013, 'Side-Lying Leg Raise', 'glutes', 'body weight', [
    'Lie on your side with legs straight and stacked.',
    'Lift the top leg slightly behind you, keeping toes pointing forward.',
    'Lower slowly and repeat before switching sides.',
  ]),
  c(10014, 'Towel Foot Scrunch', 'feet', 'towel', [
    'Sit with a towel flat under one foot.',
    'Scrunch the towel toward you using only your toes, keeping the heel down.',
    'Flatten the towel and repeat, then switch feet.',
  ]),
  c(10015, 'Short Foot Arch Lift', 'feet', 'body weight', [
    'Stand or sit with the foot flat.',
    'Pull the ball of the foot toward the heel to lift the arch, without curling the toes.',
    'Hold for 5 seconds and relax.',
  ]),
  c(10016, 'Thoracic Roller Extension', 'upper back', 'foam roller', [
    'Lie on your back with a foam roller across your mid-back, hands supporting your head.',
    'Keep your hips down and gently extend back over the roller.',
    'Move the roller up a few centimetres at a time and repeat.',
  ]),
  c(10017, 'Single-Leg Balance', 'ankle stabilizers', 'body weight', [
    'Stand on one leg with a slight bend in the knee.',
    'Keep your hips level and your foot arch lifted.',
    'Hold for the set time, then switch. Close your eyes to make it harder.',
  ]),
  c(10018, 'Band Pull-Apart', 'rear delts', 'band', [
    'Hold a band at shoulder height with straight arms, hands shoulder-width apart.',
    'Pull the band apart by squeezing your shoulder blades together until it touches your chest.',
    'Return slowly and repeat.',
  ]),
  c(10019, 'Band External Rotation', 'rotator cuff', 'band', [
    'Anchor a band at elbow height and stand side-on to it.',
    'Hold the band with the outer hand, elbow bent 90 degrees and tucked to your side.',
    'Rotate the forearm outward without moving the elbow, then return slowly. Switch sides.',
  ]),
  c(10020, 'Scapular Wall Slide', 'upper back', 'body weight', [
    'Face a wall with forearms on it, elbows at shoulder height.',
    'Slide your forearms up the wall while letting the shoulder blades rotate upward.',
    'Lift slightly off the wall at the top, then slide back down.',
  ]),
  c(10021, 'Bird Dog', 'core', 'body weight', [
    'Start on hands and knees with a neutral spine.',
    'Extend one arm forward and the opposite leg back until both are level with your torso.',
    'Hold briefly without rotating your hips, return, and switch sides.',
  ]),
  c(10022, 'Cat-Cow', 'spine', 'body weight', [
    'Start on hands and knees.',
    'Inhale while dropping your belly and lifting your chest and tailbone (cow).',
    'Exhale while rounding your back and tucking your chin and tailbone (cat). Move slowly between the two.',
  ]),
  c(10023, 'Pigeon Pose', 'glutes', 'body weight', [
    'From hands and knees, bring one knee forward behind the same-side wrist, shin angled across.',
    'Extend the other leg straight back and square your hips.',
    'Lower your torso over the front leg and hold, then switch.',
  ]),
  c(10024, 'Plank', 'core', 'body weight', [
    'Rest on your forearms and toes with elbows under your shoulders.',
    'Keep a straight line from head to heels, bracing your abs and squeezing your glutes.',
    'Hold for the set time without letting your hips sag.',
  ]),
];
