const exercises = [
  // --- CHEST ---
  { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Lie on bench','Grip bar wider than shoulders','Lower to mid-chest','Press up'], secondaryMuscles: ['Triceps','Front Delts'] },
  { id: 2, name: 'Incline Barbell Press', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Bench at 45 degrees','Lower bar to upper chest','Press up'], secondaryMuscles: ['Triceps','Front Delts'] },
  { id: 3, name: 'Decline Barbell Press', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Decline bench','Lower bar to lower chest','Press up'], secondaryMuscles: ['Triceps','Front Delts'] },
  { id: 4, name: 'Dumbbell Bench Press', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Hold dumbbells over chest','Lower to sides','Press up'], secondaryMuscles: ['Triceps','Front Delts'] },
  { id: 5, name: 'Incline Dumbbell Press', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Incline bench','Dumbbells to upper chest','Press up'], secondaryMuscles: ['Triceps','Front Delts'] },
  { id: 6, name: 'Decline Dumbbell Press', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Decline bench','Dumbbells to lower chest','Press up'], secondaryMuscles: ['Triceps','Front Delts'] },
  { id: 7, name: 'Dumbbell Flys', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Lie on bench','Dumbbells in arc','Squeeze at top'], secondaryMuscles: ['Front Delts'] },
  { id: 8, name: 'Incline Dumbbell Flys', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Incline bench','Dumbbells in arc','Squeeze chest'], secondaryMuscles: ['Front Delts'] },
  { id: 9, name: 'Cable Crossover (High)', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Cables high','Pull down and across','Squeeze lower chest'], secondaryMuscles: ['Front Delts'] },
  { id: 10, name: 'Cable Crossover (Low)', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Cables low','Pull up and in','Squeeze upper chest'], secondaryMuscles: ['Front Delts'] },
  { id: 11, name: 'Push-Up', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Hands shoulder width','Lower body straight','Push back up'], secondaryMuscles: ['Triceps','Core'] },
  { id: 12, name: 'Wide Grip Push-Up', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Hands wider than shoulders','Lower chest','Push up'], secondaryMuscles: ['Front Delts'] },
  { id: 13, name: 'Diamond Push-Up', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Hands in diamond shape','Lower chest to hands','Focus on triceps'], secondaryMuscles: ['Triceps'] },
  { id: 14, name: 'Dips (Chest Focus)', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Lean forward','Lower until stretch','Press up'], secondaryMuscles: ['Triceps','Front Delts'] },
  { id: 15, name: 'Pec Deck Machine', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Sit back','Bring handles together','Squeeze chest'], secondaryMuscles: [] },
  { id: 16, name: 'Chest Press Machine', muscleGroup: 'Chest', difficulty: 'E', instructions: ['Adjust seat','Push handles forward','Control return'], secondaryMuscles: ['Triceps'] },
  { id: 17, name: 'Floor Press (Barbell)', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Lie on floor','Lower elbows to floor','Press up'], secondaryMuscles: ['Triceps'] },
  { id: 18, name: 'Dumbbell Pull-Over', muscleGroup: 'Chest', difficulty: 'D', instructions: ['Lie across bench','Lower weight behind head','Pull back over chest'], secondaryMuscles: ['Lats','Triceps'] },
  { id: 19, name: 'Weighted Push-Up', muscleGroup: 'Chest', difficulty: 'C', instructions: ['Place weight on back','Standard push-up form','Keep core tight'], secondaryMuscles: ['Triceps','Core'] },
  { id: 20, name: 'Single Arm Dumbbell Press', muscleGroup: 'Chest', difficulty: 'D', instructions: ['One dumbbell','Press while balancing','Engage core'], secondaryMuscles: ['Core','Front Delts'] },

  // --- BACK ---
  { id: 21, name: 'Deadlift (Conventional)', muscleGroup: 'Back', difficulty: 'C', instructions: ['Feet hip width','Flat back','Pull bar up legs','Lock out hips'], secondaryMuscles: ['Legs','Glutes','Core'] },
  { id: 22, name: 'Sumo Deadlift', muscleGroup: 'Back', difficulty: 'C', instructions: ['Wide stance','Hands inside knees','Upright torso','Pull bar up'], secondaryMuscles: ['Adductors','Glutes'] },
  { id: 23, name: 'Pull-Up', muscleGroup: 'Back', difficulty: 'D', instructions: ['Wide overhand grip','Pull chin over bar','Full extension at bottom'], secondaryMuscles: ['Biceps','Forearms'] },
  { id: 24, name: 'Chin-Up', muscleGroup: 'Back', difficulty: 'E', instructions: ['Underhand grip','Pull chin over bar','Squeeze biceps'], secondaryMuscles: ['Biceps','Rear Delts'] },
  { id: 25, name: 'Lat Pulldown (Wide)', muscleGroup: 'Back', difficulty: 'E', instructions: ['Sit upright','Pull bar to chest','Squeeze lats'], secondaryMuscles: ['Biceps'] },
  { id: 26, name: 'Lat Pulldown (Close Grip)', muscleGroup: 'Back', difficulty: 'E', instructions: ['V-bar handle','Pull to chest','Lean back slightly'], secondaryMuscles: ['Biceps','Lower Lats'] },
  { id: 27, name: 'Barbell Row', muscleGroup: 'Back', difficulty: 'D', instructions: ['Bend 45 degrees','Pull bar to waist','Squeeze shoulder blades'], secondaryMuscles: ['Biceps','Rear Delts'] },
  { id: 28, name: 'One Arm Dumbbell Row', muscleGroup: 'Back', difficulty: 'E', instructions: ['One hand on bench','Pull dumbbell to hip','Control negative'], secondaryMuscles: ['Biceps','Core'] },
  { id: 29, name: 'Seated Cable Row', muscleGroup: 'Back', difficulty: 'E', instructions: ['Feet on pads','Pull handle to belly','Keep back straight'], secondaryMuscles: ['Biceps','Rear Delts'] },
  { id: 30, name: 'T-Bar Row', muscleGroup: 'Back', difficulty: 'D', instructions: ['Straddle bar','Pull handle to chest','Lower slowly'], secondaryMuscles: ['Biceps','Traps'] },
  { id: 31, name: 'Chest Supported Row', muscleGroup: 'Back', difficulty: 'E', instructions: ['Lie face down on incline bench','Pull dumbbells up','Squeeze back'], secondaryMuscles: ['Biceps'] },
  { id: 32, name: 'Face Pull', muscleGroup: 'Back', difficulty: 'E', instructions: ['Rope at face height','Pull to forehead','Rotate elbows out'], secondaryMuscles: ['Rear Delts','Traps'] },
  { id: 33, name: 'Back Extension', muscleGroup: 'Back', difficulty: 'E', instructions: ['Hinge at hips','Raise torso until straight','Squeeze lower back'], secondaryMuscles: ['Glutes'] },
  { id: 34, name: 'Superman', muscleGroup: 'Back', difficulty: 'E', instructions: ['Lie face down','Lift arms and legs','Hold and squeeze back'], secondaryMuscles: ['Glutes'] },
  { id: 35, name: 'Good Mornings', muscleGroup: 'Back', difficulty: 'C', instructions: ['Bar on traps','Hinge at hips','Maintain flat back'], secondaryMuscles: ['Hamstrings'] },
  { id: 36, name: 'Rack Pulls', muscleGroup: 'Back', difficulty: 'D', instructions: ['Bar on pins','Standard deadlift pull','Focus on upper back'], secondaryMuscles: ['Traps','Glutes'] },
  { id: 37, name: 'Meadows Row', muscleGroup: 'Back', difficulty: 'D', instructions: ['Landmine setup','Overhand grip','Pull elbow high'], secondaryMuscles: ['Biceps','Rear Delts'] },
  { id: 38, name: 'Single Arm Lat Pulldown', muscleGroup: 'Back', difficulty: 'D', instructions: ['Sit sideways','Pull one handle down','Focus on lat stretch'], secondaryMuscles: ['Core'] },
  { id: 39, name: 'Inverted Row', muscleGroup: 'Back', difficulty: 'E', instructions: ['Hang under bar','Pull chest to bar','Keep body rigid'], secondaryMuscles: ['Biceps'] },
  { id: 40, name: 'Straight Arm Pulldown', muscleGroup: 'Back', difficulty: 'E', instructions: ['Keep arms straight','Pull bar to thighs','Squeeze lats'], secondaryMuscles: ['Triceps'] },

  // --- LEGS ---
  { id: 41, name: 'Back Squat (High Bar)', muscleGroup: 'Legs', difficulty: 'C', instructions: ['Bar on traps','Feet shoulder width','Squat deep','Drive up'], secondaryMuscles: ['Glutes','Core'] },
  { id: 42, name: 'Back Squat (Low Bar)', muscleGroup: 'Legs', difficulty: 'C', instructions: ['Bar on rear delts','Leaning forward more','Drive with hips'], secondaryMuscles: ['Glutes','Lower Back'] },
  { id: 43, name: 'Front Squat', muscleGroup: 'Legs', difficulty: 'B', instructions: ['Bar on front delts','Upright torso','Elbows high','Squat deep'], secondaryMuscles: ['Core','Quads'] },
  { id: 44, name: 'Goblet Squat', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Hold dumbbell at chest','Elbows inside knees','Squat deep'], secondaryMuscles: ['Core'] },
  { id: 45, name: 'Leg Press', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Feet shoulder width','Lower platform','Don\'t lock knees at top'], secondaryMuscles: ['Glutes'] },
  { id: 46, name: 'Hack Squat Machine', muscleGroup: 'Legs', difficulty: 'D', instructions: ['Lean back in machine','Squat deep','Focus on quads'], secondaryMuscles: ['Glutes'] },
  { id: 47, name: 'Walking Lunges', muscleGroup: 'Legs', difficulty: 'D', instructions: ['Big step forward','Drop back knee','Keep torso upright'], secondaryMuscles: ['Glutes','Balance'] },
  { id: 48, name: 'Bulgarian Split Squat', muscleGroup: 'Legs', difficulty: 'C', instructions: ['One foot on bench','Squat on front leg','Leaning forward for glutes'], secondaryMuscles: ['Glutes','Balance'] },
  { id: 49, name: 'Romanian Deadlift', muscleGroup: 'Legs', difficulty: 'D', instructions: ['Hinge at hips','Bar along legs','Feel hamstring stretch'], secondaryMuscles: ['Glutes','Back'] },
  { id: 50, name: 'Lying Leg Curl', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Lie face down','Curl legs up','Squeeze hamstrings'], secondaryMuscles: [] },
  { id: 51, name: 'Seated Leg Curl', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Sit upright','Curl legs under','Focus on contraction'], secondaryMuscles: [] },
  { id: 52, name: 'Leg Extension', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Sit back','Extend legs straight','Squeeze quads'], secondaryMuscles: [] },
  { id: 53, name: 'Stiff Leg Deadlift', muscleGroup: 'Legs', difficulty: 'C', instructions: ['Legs almost straight','Hinge deep','Bar away from body slightly'], secondaryMuscles: ['Hamstrings','Back'] },
  { id: 54, name: 'Hip Thrust (Barbell)', muscleGroup: 'Legs', difficulty: 'D', instructions: ['Back on bench','Bar over hips','Drive heels down','Squeeze glutes'], secondaryMuscles: ['Hamstrings'] },
  { id: 55, name: 'Glute Bridge', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Lie on floor','Lift hips','Squeeze glutes at top'], secondaryMuscles: [] },
  { id: 56, name: 'Calf Raise (Standing)', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Stand on edge','Rise on toes','Full stretch at bottom'], secondaryMuscles: [] },
  { id: 57, name: 'Calf Raise (Seated)', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Sit in machine','Rise on toes','Focus on soleus'], secondaryMuscles: [] },
  { id: 58, name: 'Step-Ups', muscleGroup: 'Legs', difficulty: 'D', instructions: ['Step onto box','Drive through front heel','Control descent'], secondaryMuscles: ['Glutes','Balance'] },
  { id: 59, name: 'Sumo Squat (Dumbbell)', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Wide stance','Dumbbell between legs','Squat deep'], secondaryMuscles: ['Adductors','Glutes'] },
  { id: 60, name: 'Box Squat', muscleGroup: 'Legs', difficulty: 'D', instructions: ['Sit back to box','Pause briefly','Drive up explosively'], secondaryMuscles: ['Glutes','Core'] },

  // --- SHOULDERS ---
  { id: 61, name: 'Overhead Press (Barbell)', muscleGroup: 'Shoulders', difficulty: 'C', instructions: ['Stand tall','Press bar overhead','Keep core tight','Lock out at top'], secondaryMuscles: ['Triceps','Core'] },
  { id: 62, name: 'Seated Dumbbell Press', muscleGroup: 'Shoulders', difficulty: 'D', instructions: ['Sit with back support','Dumbbells at ears','Press up','Squeeze at top'], secondaryMuscles: ['Triceps'] },
  { id: 63, name: 'Arnold Press', muscleGroup: 'Shoulders', difficulty: 'D', instructions: ['Palms face you','Rotate while pressing','Reverse on way down'], secondaryMuscles: ['Triceps'] },
  { id: 64, name: 'Lateral Raise (Dumbbell)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Arms slightly bent','Raise to shoulder height','Lower slowly'], secondaryMuscles: ['Traps'] },
  { id: 65, name: 'Lateral Raise (Cable)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Cable low','Pull across body','Constant tension'], secondaryMuscles: [] },
  { id: 66, name: 'Front Raise (Dumbbell)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Raise weights in front','Stop at shoulder level','Alternate arms'], secondaryMuscles: [] },
  { id: 67, name: 'Front Raise (Plate)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Hold plate','Raise to eye level','Lower with control'], secondaryMuscles: [] },
  { id: 68, name: 'Rear Delt Fly (Dumbbell)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Bend 45 degrees','Raise arms to sides','Squeeze rear delts'], secondaryMuscles: ['Upper Back'] },
  { id: 69, name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Sit facing machine','Push handles back','Squeeze rear delts'], secondaryMuscles: ['Traps'] },
  { id: 70, name: 'Upright Row (Barbell)', muscleGroup: 'Shoulders', difficulty: 'D', instructions: ['Grip bar narrow','Pull to chin','Elbows lead the way'], secondaryMuscles: ['Traps'] },
  { id: 71, name: 'Shrugs (Barbell)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Hold bar at thighs','Lift shoulders to ears','Squeeze traps'], secondaryMuscles: [] },
  { id: 72, name: 'Shrugs (Dumbbell)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Dumbbells at sides','Lift shoulders','Hold and squeeze'], secondaryMuscles: [] },
  { id: 73, name: 'Push Press', muscleGroup: 'Shoulders', difficulty: 'B', instructions: ['Dip knees','Drive bar overhead','Use leg power'], secondaryMuscles: ['Triceps','Legs'] },
  { id: 74, name: 'Handstand Push-Up', muscleGroup: 'Shoulders', difficulty: 'A', instructions: ['Balance against wall','Lower head to floor','Press back up'], secondaryMuscles: ['Triceps','Core'] },
  { id: 75, name: 'Face Pull (High Cable)', muscleGroup: 'Shoulders', difficulty: 'E', instructions: ['Pull rope to forehead','External rotation','Squeeze rear delts'], secondaryMuscles: ['Traps'] },

  // --- ARMS (BICEPS & TRICEPS) ---
  { id: 76, name: 'Barbell Bicep Curl', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Stand with bar','Curl to chest','Keep elbows still'], secondaryMuscles: ['Forearms'] },
  { id: 77, name: 'EZ Bar Curl', muscleGroup: 'Arms', difficulty: 'E', instructions: ['EZ bar for wrists','Curl up','Full extension'], secondaryMuscles: ['Forearms'] },
  { id: 78, name: 'Dumbbell Bicep Curl', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Alternate arms','Rotate palms up','Squeeze at top'], secondaryMuscles: [] },
  { id: 79, name: 'Hammer Curl', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Neutral grip','Curl up','Targets brachialis'], secondaryMuscles: ['Forearms'] },
  { id: 80, name: 'Preacher Curl', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Arms on pad','Curl up','Prevents cheating'], secondaryMuscles: [] },
  { id: 81, name: 'Concentration Curl', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Sit on bench','Elbow against leg','Curl dumbbell'], secondaryMuscles: [] },
  { id: 82, name: 'Cable Bicep Curl', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Low cable','Constant tension','Curl up'], secondaryMuscles: [] },
  { id: 83, name: 'Spider Curl', muscleGroup: 'Arms', difficulty: 'D', instructions: ['Lean on incline bench','Arms hang down','Curl up'], secondaryMuscles: [] },
  { id: 84, name: 'Tricep Rope Pushdown', muscleGroup: 'Arms', difficulty: 'E', instructions: ['High cable','Press down','Split rope at bottom'], secondaryMuscles: [] },
  { id: 85, name: 'Tricep Straight Bar Pushdown', muscleGroup: 'Arms', difficulty: 'E', instructions: ['High cable','Press bar down','Lock out triceps'], secondaryMuscles: [] },
  { id: 86, name: 'Skull Crushers (EZ Bar)', muscleGroup: 'Arms', difficulty: 'D', instructions: ['Lie on bench','Lower bar to forehead','Extend back up'], secondaryMuscles: [] },
  { id: 87, name: 'Overhead Dumbbell Extension', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Weight behind head','Extend arms up','Keep elbows tucked'], secondaryMuscles: [] },
  { id: 88, name: 'Dips (Tricep Focus)', muscleGroup: 'Arms', difficulty: 'D', instructions: ['Upright torso','Lower slowly','Lock out at top'], secondaryMuscles: ['Chest'] },
  { id: 89, name: 'Close Grip Bench Press', muscleGroup: 'Arms', difficulty: 'D', instructions: ['Grip shoulder width','Lower to chest','Press up focusing on triceps'], secondaryMuscles: ['Chest'] },
  { id: 90, name: 'Tricep Kickback (Dumbbell)', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Lean forward','Extend arm back','Squeeze tricep'], secondaryMuscles: [] },
  { id: 91, name: 'Tricep Kickback (Cable)', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Cable handle','Extend arm back','Slow return'], secondaryMuscles: [] },
  { id: 92, name: 'Reverse Grip Tricep Pushdown', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Underhand grip','Press down','Targets medial head'], secondaryMuscles: [] },
  { id: 93, name: 'Single Arm Overhead Extension', muscleGroup: 'Arms', difficulty: 'E', instructions: ['One dumbbell','Lower behind head','Extend up'], secondaryMuscles: [] },
  { id: 94, name: 'Bench Dips', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Hands on bench','Feet on floor','Lower hips','Press up'], secondaryMuscles: [] },
  { id: 95, name: 'Zottman Curl', muscleGroup: 'Arms', difficulty: 'D', instructions: ['Curl up palms up','Rotate palms down','Lower slowly'], secondaryMuscles: ['Forearms'] },

  // --- CORE ---
  { id: 96, name: 'Plank', muscleGroup: 'Core', difficulty: 'E', instructions: ['Forearms on floor','Body straight','Hold position'], secondaryMuscles: ['Shoulders'] },
  { id: 97, name: 'Side Plank', muscleGroup: 'Core', difficulty: 'E', instructions: ['One forearm','Body sideways','Hold and switch sides'], secondaryMuscles: ['Obliques'] },
  { id: 98, name: 'Hanging Leg Raise', muscleGroup: 'Core', difficulty: 'C', instructions: ['Hang from bar','Raise legs to 90 degrees','Lower slowly'], secondaryMuscles: ['Hip Flexors'] },
  { id: 99, name: 'Captain\'s Chair Leg Raise', muscleGroup: 'Core', difficulty: 'E', instructions: ['Back against pad','Raise knees','Squeeze abs'], secondaryMuscles: ['Hip Flexors'] },
  { id: 100, name: 'Ab Wheel Rollout', muscleGroup: 'Core', difficulty: 'C', instructions: ['Kneel down','Roll wheel forward','Pull back with abs'], secondaryMuscles: ['Lats','Lower Back'] },
  { id: 101, name: 'Cable Crunch', muscleGroup: 'Core', difficulty: 'E', instructions: ['Kneel facing cable','Pull rope to floor','Curl your spine'], secondaryMuscles: [] },
  { id: 102, name: 'Russian Twist', muscleGroup: 'Core', difficulty: 'E', instructions: ['Sit with feet up','Rotate side to side','Touch weight to floor'], secondaryMuscles: ['Obliques'] },
  { id: 103, name: 'Bicycle Crunches', muscleGroup: 'Core', difficulty: 'E', instructions: ['Lie on back','Elbow to opposite knee','Pedal legs'], secondaryMuscles: ['Obliques'] },
  { id: 104, name: 'Leg Raises (Floor)', muscleGroup: 'Core', difficulty: 'E', instructions: ['Lie on back','Raise legs straight up','Lower without touching floor'], secondaryMuscles: [] },
  { id: 105, name: 'V-Ups', muscleGroup: 'Core', difficulty: 'D', instructions: ['Lie flat','Touch toes and hands at top','V-shape body'], secondaryMuscles: [] },
  { id: 106, name: 'Dead Bug', muscleGroup: 'Core', difficulty: 'E', instructions: ['Lie on back','Opposite arm/leg extension','Keep back flat'], secondaryMuscles: [] },
  { id: 107, name: 'Bird Dog', muscleGroup: 'Core', difficulty: 'E', instructions: ['On all fours','Extend opposite arm/leg','Balance and squeeze'], secondaryMuscles: ['Back'] },
  { id: 108, name: 'Woodchopper (Cable)', muscleGroup: 'Core', difficulty: 'E', instructions: ['Cable at shoulder height','Rotate and pull across','Pivot feet'], secondaryMuscles: ['Obliques'] },
  { id: 109, name: 'Hollow Body Hold', muscleGroup: 'Core', difficulty: 'D', instructions: ['Lie on back','Lift head and legs','Curve body like banana'], secondaryMuscles: [] },
  { id: 110, name: 'Dragon Flag', muscleGroup: 'Core', difficulty: 'A', instructions: ['Grip bench behind head','Raise body straight','Lower slowly as one unit'], secondaryMuscles: ['Full Body'] },

  // --- YOGA (Selected) ---
  { id: 201, name: 'Downward Dog', muscleGroup: 'Full Body', difficulty: 'E', instructions: ['Hands and feet on floor','Hips to ceiling','V-shape'], secondaryMuscles: ['Hamstrings','Shoulders'] },
  { id: 202, name: 'Cobra Pose', muscleGroup: 'Core', difficulty: 'E', instructions: ['Lie face down','Lift chest','Arch back'], secondaryMuscles: ['Back'] },
  { id: 203, name: 'Warrior I', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Lunge forward','Arms up','Back foot at 45 degrees'], secondaryMuscles: ['Shoulders'] },
  { id: 204, name: 'Warrior II', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Lunge forward','Arms to sides','Look over front hand'], secondaryMuscles: ['Shoulders'] },
  { id: 205, name: 'Tree Pose', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Stand on one leg','Foot on inner thigh','Hands at chest'], secondaryMuscles: ['Balance'] },
  { id: 206, name: 'Child\'s Pose', muscleGroup: 'Back', difficulty: 'E', instructions: ['Kneel and sit on heels','Reach forward','Rest forehead'], secondaryMuscles: [] },
  { id: 207, name: 'Cat-Cow', muscleGroup: 'Back', difficulty: 'E', instructions: ['On all fours','Arch back up','Then arch down','Synchronize breath'], secondaryMuscles: ['Core'] },
  { id: 208, name: 'Pigeon Pose', muscleGroup: 'Legs', difficulty: 'D', instructions: ['One leg forward bent','Back leg straight','Lean forward'], secondaryMuscles: ['Glutes'] },
  { id: 209, name: 'Crow Pose', muscleGroup: 'Arms', difficulty: 'C', instructions: ['Hands on floor','Knees on triceps','Balance forward'], secondaryMuscles: ['Core','Shoulders'] },
  { id: 210, name: 'Triangle Pose', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Wide stance','Reach for foot','Other arm up'], secondaryMuscles: ['Obliques'] },

  // --- HIIT / CARDIO ---
  { id: 301, name: 'Burpees', muscleGroup: 'Full Body', difficulty: 'D', instructions: ['Drop to push-up','Jump feet in','Jump up explosively'], secondaryMuscles: ['Heart Rate'] },
  { id: 302, name: 'Mountain Climbers', muscleGroup: 'Core', difficulty: 'E', instructions: ['Push-up position','Drive knees to chest','Fast alternating'], secondaryMuscles: ['Shoulders'] },
  { id: 303, name: 'Jumping Jacks', muscleGroup: 'Full Body', difficulty: 'E', instructions: ['Jump legs out','Arms overhead','Jump back'], secondaryMuscles: [] },
  { id: 304, name: 'High Knees', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Run in place','Lift knees high','Fast pace'], secondaryMuscles: [] },
  { id: 305, name: 'Box Jumps', muscleGroup: 'Legs', difficulty: 'D', instructions: ['Jump onto box','Land softly','Step down'], secondaryMuscles: ['Explosiveness'] },
  { id: 306, name: 'Battle Ropes', muscleGroup: 'Arms', difficulty: 'E', instructions: ['Wave ropes','Fast alternating','Keep core tight'], secondaryMuscles: ['Shoulders','Back'] },
  { id: 307, name: 'Jump Rope', muscleGroup: 'Legs', difficulty: 'E', instructions: ['Stay on toes','Small jumps','Consistent rhythm'], secondaryMuscles: ['Cardio'] },
  { id: 308, name: 'Kettlebell Swing', muscleGroup: 'Back', difficulty: 'D', instructions: ['Hinge at hips','Swing bell to eye level','Drive with glutes'], secondaryMuscles: ['Legs','Shoulders'] },
  { id: 309, name: 'Medicine Ball Slam', muscleGroup: 'Core', difficulty: 'E', instructions: ['Lift ball overhead','Slam down hard','Use full body'], secondaryMuscles: ['Arms','Shoulders'] },
  { id: 310, name: 'Sled Push', muscleGroup: 'Legs', difficulty: 'C', instructions: ['Lean into sled','Drive with legs','Maintain straight back'], secondaryMuscles: ['Full Body'] },
];

function getExerciseDetails(name, baseName, variationName) {
  const lowercaseName = name.toLowerCase();
  
  let instructions = [];
  let secondaryMuscles = [];
  
  if (lowercaseName.includes('bench press') || lowercaseName.includes('floor press')) {
    instructions = [
      `Set up your ${variationName || 'equipment'} and lie flat on your back.`,
      `Grip the weight firmly, slightly wider than shoulder-width.`,
      `Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.`,
      `Press the weight back up explosively until your arms are fully extended.`
    ];
    secondaryMuscles = ['Triceps', 'Front Delts'];
  } else if (lowercaseName.includes('shoulder press') || lowercaseName.includes('overhead press') || lowercaseName.includes('arnold press') || lowercaseName.includes('push press')) {
    instructions = [
      `Hold the ${variationName || 'weight'} at shoulder height with your palms facing forward.`,
      `Brace your core and press the weight directly overhead until your elbows lock out.`,
      `Ensure you do not arch your lower back during the lift.`,
      `Lower the weight back down to your shoulders with control.`
    ];
    secondaryMuscles = ['Triceps', 'Upper Traps'];
  } else if (lowercaseName.includes('squat') || lowercaseName.includes('lunge') || lowercaseName.includes('step-up')) {
    instructions = [
      `Stand upright with feet shoulder-width apart, holding the ${variationName || 'weight'}.`,
      `Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.`,
      `Keep your chest up, back straight, and knees aligned with your toes.`,
      `Drive through your heels to return to the standing position.`
    ];
    secondaryMuscles = ['Glutes', 'Hamstrings', 'Core'];
  } else if (lowercaseName.includes('deadlift') || lowercaseName.includes('rdl') || lowercaseName.includes('good morning')) {
    instructions = [
      `Stand with feet hip-width apart. Keep the ${variationName || 'weight'} close to your shins/body.`,
      `Hinge at your hips and bend your knees slightly to reach the weight.`,
      `Keep your spine neutral, shoulder blades pulled back, and core braced.`,
      `Push through your feet to stand up straight, locking out your hips at the top.`
    ];
    secondaryMuscles = ['Glutes', 'Hamstrings', 'Lower Back'];
  } else if (lowercaseName.includes('row') || lowercaseName.includes('pulldown') || lowercaseName.includes('pull-up') || lowercaseName.includes('pullup') || lowercaseName.includes('chin-up')) {
    instructions = [
      `Position yourself and grip the ${variationName || 'weight'} securely.`,
      `Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.`,
      `Focus on squeezing your shoulder blades together at the peak contraction.`,
      `Extend your arms back to the starting position under complete control.`
    ];
    secondaryMuscles = ['Biceps', 'Rear Delts'];
  } else if (lowercaseName.includes('curl')) {
    instructions = [
      `Stand or sit upright, holding the ${variationName || 'weight'} with a firm grip.`,
      `Pin your elbows to your sides and curl the weight upwards toward your chest.`,
      `Squeeze your biceps hard at the top of the movement.`,
      `Lower the weight slowly to the starting position, fully extending your arms.`
    ];
    secondaryMuscles = ['Forearms'];
  } else if (lowercaseName.includes('tricep') || lowercaseName.includes('extension') || lowercaseName.includes('skull crusher') || lowercaseName.includes('dip') || lowercaseName.includes('pushdown') || lowercaseName.includes('kickback')) {
    instructions = [
      `Position yourself and grip the ${variationName || 'weight'} securely.`,
      `Extend your arms to push or pull the weight, moving only at the elbows.`,
      `Squeeze your triceps forcefully at the point of full extension.`,
      `Slowly return the weight to the starting position, keeping your upper arms stationary.`
    ];
    secondaryMuscles = ['Chest', 'Front Delts'];
  } else if (lowercaseName.includes('crunch') || lowercaseName.includes('raise') || lowercaseName.includes('plank') || lowercaseName.includes('twist') || lowercaseName.includes('superman') || lowercaseName.includes('sit-up')) {
    instructions = [
      `Lie or position yourself on the floor/mat.`,
      `Engage your core muscles to perform the contraction or hold.`,
      `Control the movement, avoiding momentum and neck strain.`,
      `Slowly return to the starting position, keeping tension on your core.`
    ];
    secondaryMuscles = ['Hip Flexors', 'Obliques'];
  } else {
    instructions = [
      `Set up the ${variationName || 'equipment'} and assume the starting stance.`,
      `Execute the movement through a full range of motion with control.`,
      `Squeeze the target muscles at the peak of the contraction.`,
      `Return to the starting position slowly, keeping tension on the muscle.`
    ];
    secondaryMuscles = [];
  }
  
  return { instructions, secondaryMuscles };
}

const variations = [
  'Resistance Band', 'Kettlebell', 'TRX', 'Medicine Ball', 'Sandbag', 'Single Leg', 'Single Arm', 'Alternating', 'Weighted', 'Paused', 'Tempo'
];

const baseExercises = [
  { name: 'Bench Press', mg: 'Chest', diff: 'D' },
  { name: 'Shoulder Press', mg: 'Shoulders', diff: 'D' },
  { name: 'Squat', mg: 'Legs', diff: 'D' },
  { name: 'Deadlift', mg: 'Back', diff: 'C' },
  { name: 'Lunges', mg: 'Legs', diff: 'E' },
  { name: 'Rows', mg: 'Back', diff: 'E' },
  { name: 'Bicep Curls', mg: 'Arms', diff: 'E' },
  { name: 'Tricep Extensions', mg: 'Arms', diff: 'E' },
  { name: 'Crunches', mg: 'Core', diff: 'E' },
  { name: 'Leg Raises', mg: 'Core', diff: 'E' },
  { name: 'Plank Variations', mg: 'Core', diff: 'D' }
];

let currentId = 400;
baseExercises.forEach(base => {
  variations.forEach(v => {
    const fullName = `${v} ${base.name}`;
    const details = getExerciseDetails(fullName, base.name, v);
    exercises.push({
      id: currentId++,
      name: fullName,
      muscleGroup: base.mg,
      difficulty: base.diff,
      instructions: details.instructions,
      secondaryMuscles: details.secondaryMuscles
    });
  });
});

// Adding common missing exercises to reach the target count
const more = [
  { name: 'Skull Crushers', mg: 'Arms', diff: 'D' },
  { name: 'Preacher Curls', mg: 'Arms', diff: 'E' },
  { name: 'Lat Pulldowns', mg: 'Back', diff: 'E' },
  { name: 'Seated Rows', mg: 'Back', diff: 'E' },
  { name: 'Face Pulls', mg: 'Shoulders', diff: 'E' },
  { name: 'Lateral Raises', mg: 'Shoulders', diff: 'E' },
  { name: 'Calf Raises', mg: 'Legs', diff: 'E' },
  { name: 'Leg Extensions', mg: 'Legs', diff: 'E' },
  { name: 'Leg Curls', mg: 'Legs', diff: 'E' },
  { name: 'Hammer Curls', mg: 'Arms', diff: 'E' },
  { name: 'Dips', mg: 'Arms', diff: 'D' },
  { name: 'Pushups', mg: 'Chest', diff: 'E' },
  { name: 'Pullups', mg: 'Back', diff: 'D' },
  { name: 'Barbell Row', mg: 'Back', diff: 'D' },
  { name: 'Overhead Press', mg: 'Shoulders', diff: 'D' },
  { name: 'Front Squat', mg: 'Legs', diff: 'C' },
  { name: 'RDL', mg: 'Legs', diff: 'D' },
  { name: 'Hip Thrust', mg: 'Legs', diff: 'D' },
  { name: 'Bulgarian Split Squat', mg: 'Legs', diff: 'D' },
  { name: 'Arnold Press', mg: 'Shoulders', diff: 'D' }
];

// Duplicate with variations for the remaining slots
more.forEach(m => {
  const localVariations = ['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Smith Machine'];
  localVariations.forEach(v => {
    const fullName = `${v} ${m.name}`;
    const details = getExerciseDetails(fullName, m.name, v);
    exercises.push({
      id: currentId++,
      name: fullName,
      muscleGroup: m.mg,
      difficulty: m.diff,
      instructions: details.instructions,
      secondaryMuscles: details.secondaryMuscles
    });
  });
});

// --- CORRECTIVE EXERCISES ---
const correctiveExercises = [
  {
    id: 10001,
    name: 'Wall Angel',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Stand with back, head, and hips flat against a wall.',
      'Place arms on the wall in a W shape (elbows bent 90 degrees).',
      'Slide your arms up the wall until they are straight overhead.',
      'Keep your elbows and hands in contact with the wall at all times.',
      'Slowly return to the starting W shape and repeat.'
    ],
    secondaryMuscles: ['Shoulders', 'Upper Back'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/posture-exercises#wall-angels'
  },
  {
    id: 10002,
    name: 'Chin Tuck',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Sit up straight and look straight ahead.',
      'Place a finger on your chin.',
      'Without tilting your head, pull your chin back (create a double chin) away from your finger.',
      'Hold the position for 5 seconds.',
      'Relax your chin forward and repeat.'
    ],
    secondaryMuscles: ['Neck'],
    isCorrective: true,
    externalLink: 'https://www.medicalnewstoday.com/articles/chin-tucks'
  },
  {
    id: 10003,
    name: 'Doorway Pec Stretch',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Stand in an open doorway.',
      'Raise your arms up to the sides, bent at 90-degree angles with your forearms resting on the doorframe.',
      'Slowly step forward with one foot until you feel a stretch in your chest.',
      'Hold the stretch for 30 seconds.',
      'Step back, relax, and repeat.'
    ],
    secondaryMuscles: ['Chest', 'Shoulders'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/doorway-stretch'
  },
  {
    id: 10004,
    name: 'Kneeling Hip Flexor Stretch',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Kneel on your right knee, with your left foot flat on the floor in front of you (90-degree angles).',
      'Keep your back straight and squeeze your right glute.',
      'Gently shift your weight forward until you feel a stretch in the front of your right hip.',
      'Hold for 30 seconds.',
      'Switch sides and repeat.'
    ],
    secondaryMuscles: ['Legs'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/hip-flexor-stretches'
  },
  {
    id: 10005,
    name: 'Clamshell',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Lie on your side with hips and knees bent to 90 degrees, feet stacked.',
      'Keep your feet glued together as you slowly raise your top knee toward the ceiling.',
      'Do not rotate your hips or lower back; use your glute to lift.',
      'Hold for 1 second at the top, then slowly lower your knee.',
      'Perform all reps, then switch sides.'
    ],
    secondaryMuscles: ['Glutes'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/clamshell-exercise'
  },
  {
    id: 10006,
    name: 'Couch Stretch',
    muscleGroup: 'Corrective',
    difficulty: 'D',
    instructions: [
      'Place your back knee against a wall or couch, pointing your shin straight up.',
      'Step your opposite leg forward into a lunge stance with your foot flat.',
      'Slowly bring your torso upright, squeezing your glutes to stretch the hip flexors/quad.',
      'Hold for 30-60 seconds while breathing deeply.',
      'Switch legs and repeat.'
    ],
    secondaryMuscles: ['Legs', 'Quads'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/couch-stretch'
  },
  {
    id: 10007,
    name: 'Serratus Push-Up+',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Get into a push-up or forearm plank position, keeping your body in a straight line.',
      'Without bending your elbows, let your chest sink down toward the floor, pinching your shoulder blades together.',
      'Push through your hands/forearms to raise your upper back as high as possible, rounding the upper back slightly at the top.',
      'Hold the top position for 2 seconds.',
      'Repeat with slow, controlled movements.'
    ],
    secondaryMuscles: ['Chest', 'Shoulders'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/serratus-anterior-exercises'
  },
  {
    id: 10008,
    name: 'Deep Neck Flexor Hold',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Lie on your back on a flat surface without a pillow.',
      'Perform a chin tuck (pull chin straight down toward floor).',
      'Lift your head slightly (about 1 inch) off the floor while maintaining the chin tuck.',
      'Hold this position for 10-15 seconds, focusing on front neck muscles.',
      'Lower head slowly and relax.'
    ],
    secondaryMuscles: ['Neck'],
    isCorrective: true,
    externalLink: 'https://www.spine-health.com/wellness/ergonomics/chin-tuck-exercise-neck-pain'
  },
  {
    id: 10009,
    name: 'Levator Scapulae Stretch',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Sit upright and place your right hand behind your head.',
      'Place your left hand behind your back or hold onto the bottom of your chair.',
      'Gently pull your head down and look diagonally toward your right armpit.',
      'Hold the stretch for 30 seconds when you feel it in the back/side of your neck.',
      'Repeat on the opposite side.'
    ],
    secondaryMuscles: ['Neck', 'Shoulders'],
    isCorrective: true,
    externalLink: 'https://www.spine-health.com/wellness/exercise/easy-levator-scapulae-stretches'
  },
  {
    id: 10010,
    name: 'Standing Hamstring Stretch',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Place one heel on a slightly elevated surface (like a low step).',
      'Keep your leg straight, foot flexed toward the ceiling.',
      'Keep your back straight and hinge forward at your hips until you feel a stretch behind your thigh.',
      'Hold the stretch for 30 seconds.',
      'Switch sides and repeat.'
    ],
    secondaryMuscles: ['Legs'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/hamstring-stretches'
  },
  {
    id: 10011,
    name: 'Lateral Band Walk',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Place a mini resistance band around your ankles or just above your knees.',
      'Step your feet out to shoulder-width, creating tension on the band, and lower into a half-squat.',
      'Take a controlled step sideways with one foot, then follow with the other foot (keep band tense).',
      'Repeat steps in one direction, then walk back the other way.'
    ],
    secondaryMuscles: ['Glutes', 'Legs'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/lateral-band-walk'
  },
  {
    id: 10012,
    name: 'IT Band Foam Roll',
    muscleGroup: 'Corrective',
    difficulty: 'D',
    instructions: [
      'Lie on your side with a foam roller positioned under your bottom hip.',
      'Cross your top leg over and place your top foot flat on the floor for support.',
      'Slowly roll your outer thigh from just below your hip to just above your knee.',
      'Pause on tender spots for 20-30 seconds.',
      'Switch sides and repeat.'
    ],
    secondaryMuscles: ['Legs'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/foam-roller-it-band'
  },
  {
    id: 10013,
    name: 'Side-Lying Leg Raise',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Lie on your side with legs straight and stacked.',
      'Slowly raise your top leg upward (about 45 degrees), keeping your heel slightly back and foot flexed.',
      'Hold for 1 second at the top, then slowly lower your leg.',
      'Focus on using your side hip/glute muscles.',
      'Perform reps, then switch sides.'
    ],
    secondaryMuscles: ['Glutes'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/side-lying-leg-lift'
  },
  {
    id: 10014,
    name: 'Towel Foot Scrunch',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Sit on a chair with your feet flat on the floor, on top of a flat towel.',
      'Using only your toes, scrunch the towel up toward your heels.',
      'Hold the scrunch for 2 seconds, then release your toes.',
      'Repeat until you have scrunched the length of the towel.',
      'Switch feet and repeat.'
    ],
    secondaryMuscles: ['Feet'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/flat-feet-exercises'
  },
  {
    id: 10015,
    name: 'Short Foot Arch Lift',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Sit or stand with feet flat on the floor.',
      'Without curling your toes, attempt to pull the ball of your foot toward your heel.',
      'Your foot arch should lift off the floor as your foot gets shorter.',
      'Hold the contraction for 5 seconds.',
      'Relax and repeat.'
    ],
    secondaryMuscles: ['Feet'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/short-foot-exercise'
  },
  {
    id: 10016,
    name: 'Thoracic Roller Extension',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Lie on your back with a foam roller placed under your mid-back (thoracic spine).',
      'Support your head with your hands, keeping your hips flat on the floor.',
      'Gently lean backward over the roller, extending your upper back.',
      'Hold the extension for 5-10 seconds, then lift up slightly.',
      'Move the roller slightly up/down and repeat.'
    ],
    secondaryMuscles: ['Back', 'Shoulders'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/foam-roller-back-extension'
  },
  {
    id: 10017,
    name: 'Single-Leg Balance',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Stand with feet hip-width apart, arms at your sides.',
      'Shift your weight to one foot and lift the opposite foot off the floor.',
      'Maintain your balance, keeping your hips level and core braced.',
      'Hold for 30-60 seconds.',
      'Switch sides and repeat. Close eyes for added difficulty.'
    ],
    secondaryMuscles: ['Legs', 'Core'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/balance-exercises'
  },
  {
    id: 10018,
    name: 'Band Pull-Apart',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Stand upright, holding a resistance band in front of you at shoulder height.',
      'Keep your arms straight and pull the band apart, squeezing your shoulder blades together.',
      'The band should touch your chest at the end of the movement.',
      'Slowly return to the start position with control.'
    ],
    secondaryMuscles: ['Shoulders', 'Upper Back'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/band-pull-apart'
  },
  {
    id: 10019,
    name: 'Band External Rotation',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Hold a resistance band with both hands, palms up, elbows bent to 90 degrees by your sides.',
      'Keep your elbows pinned to your ribs and rotate your hands outward.',
      'Squeeze the back of your shoulders at the outer limit.',
      'Slowly return to the starting position.'
    ],
    secondaryMuscles: ['Shoulders'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/shoulder-external-rotation'
  },
  {
    id: 10020,
    name: 'Scapular Wall Slide',
    muscleGroup: 'Corrective',
    difficulty: 'E',
    instructions: [
      'Stand with your back, head, and elbows against a wall.',
      'Slide your shoulder blades down and back, squeezing them together.',
      'Slide your forearms up the wall slightly, keeping contact.',
      'Slowly pull elbows down, focusing on lower trap activation.'
    ],
    secondaryMuscles: ['Upper Back', 'Shoulders'],
    isCorrective: true,
    externalLink: 'https://www.healthline.com/health/scapular-wall-slides'
  }
];

exercises.push(...correctiveExercises);

export default exercises;
