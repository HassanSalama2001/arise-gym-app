const exercises = [
  {
    "id": 1,
    "name": "Barbell Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Lie on bench",
      "Grip bar wider than shoulders",
      "Lower to mid-chest",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0025-EIeI8Vf.gif",
    "imageUrls": []
  },
  {
    "id": 2,
    "name": "Incline Barbell Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Bench at 45 degrees",
      "Lower bar to upper chest",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 3,
    "name": "Decline Barbell Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Decline bench",
      "Lower bar to lower chest",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 4,
    "name": "Dumbbell Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Hold dumbbells over chest",
      "Lower to sides",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0289-SpYC0Kp.gif",
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bench_Press/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": 5,
    "name": "Incline Dumbbell Press",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Incline bench",
      "Dumbbells to upper chest",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Press/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": 6,
    "name": "Decline Dumbbell Press",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Decline bench",
      "Dumbbells to lower chest",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 7,
    "name": "Dumbbell Flys",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Lie on bench",
      "Dumbbells in arc",
      "Squeeze at top"
    ],
    "secondaryMuscles": [
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 8,
    "name": "Incline Dumbbell Flys",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Incline bench",
      "Dumbbells in arc",
      "Squeeze chest"
    ],
    "secondaryMuscles": [
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 9,
    "name": "Cable Crossover (High)",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Cables high",
      "Pull down and across",
      "Squeeze lower chest"
    ],
    "secondaryMuscles": [
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10,
    "name": "Cable Crossover (Low)",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Cables low",
      "Pull up and in",
      "Squeeze upper chest"
    ],
    "secondaryMuscles": [
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 11,
    "name": "Push-Up",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Hands shoulder width",
      "Lower body straight",
      "Push back up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Core"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0662-I4hDWkc.gif",
    "imageUrls": []
  },
  {
    "id": 12,
    "name": "Wide Grip Push-Up",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Hands wider than shoulders",
      "Lower chest",
      "Push up"
    ],
    "secondaryMuscles": [
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 13,
    "name": "Diamond Push-Up",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Hands in diamond shape",
      "Lower chest to hands",
      "Focus on triceps"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0283-soIB2rj.gif",
    "imageUrls": []
  },
  {
    "id": 14,
    "name": "Dips (Chest Focus)",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Lean forward",
      "Lower until stretch",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 15,
    "name": "Pec Deck Machine",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Sit back",
      "Bring handles together",
      "Squeeze chest"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 16,
    "name": "Chest Press Machine",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Adjust seat",
      "Push handles forward",
      "Control return"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 17,
    "name": "Floor Press (Barbell)",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Lie on floor",
      "Lower elbows to floor",
      "Press up"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 18,
    "name": "Dumbbell Pull-Over",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Lie across bench",
      "Lower weight behind head",
      "Pull back over chest"
    ],
    "secondaryMuscles": [
      "Lats",
      "Triceps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 19,
    "name": "Weighted Push-Up",
    "muscleGroup": "Chest",
    "difficulty": "C",
    "instructions": [
      "Place weight on back",
      "Standard push-up form",
      "Keep core tight"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 20,
    "name": "Single Arm Dumbbell Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "One dumbbell",
      "Press while balancing",
      "Engage core"
    ],
    "secondaryMuscles": [
      "Core",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 21,
    "name": "Deadlift (Conventional)",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Feet hip width",
      "Flat back",
      "Pull bar up legs",
      "Lock out hips"
    ],
    "secondaryMuscles": [
      "Legs",
      "Glutes",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 22,
    "name": "Sumo Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Wide stance",
      "Hands inside knees",
      "Upright torso",
      "Pull bar up"
    ],
    "secondaryMuscles": [
      "Adductors",
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Sumo_Deadlift/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Sumo_Deadlift/1.jpg"
    ]
  },
  {
    "id": 23,
    "name": "Pull-Up",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Wide overhand grip",
      "Pull chin over bar",
      "Full extension at bottom"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0652-lBDjFxJ.gif",
    "imageUrls": []
  },
  {
    "id": 24,
    "name": "Chin-Up",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Underhand grip",
      "Pull chin over bar",
      "Squeeze biceps"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/1326-T2mxWqc.gif",
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Chin-Up/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Chin-Up/1.jpg"
    ]
  },
  {
    "id": 25,
    "name": "Lat Pulldown (Wide)",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Sit upright",
      "Pull bar to chest",
      "Squeeze lats"
    ],
    "secondaryMuscles": [
      "Biceps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 26,
    "name": "Lat Pulldown (Close Grip)",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "V-bar handle",
      "Pull to chest",
      "Lean back slightly"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Lower Lats"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 27,
    "name": "Barbell Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Bend 45 degrees",
      "Pull bar to waist",
      "Squeeze shoulder blades"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 28,
    "name": "One Arm Dumbbell Row",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "One hand on bench",
      "Pull dumbbell to hip",
      "Control negative"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 29,
    "name": "Seated Cable Row",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Feet on pads",
      "Pull handle to belly",
      "Keep back straight"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 30,
    "name": "T-Bar Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Straddle bar",
      "Pull handle to chest",
      "Lower slowly"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 31,
    "name": "Chest Supported Row",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Lie face down on incline bench",
      "Pull dumbbells up",
      "Squeeze back"
    ],
    "secondaryMuscles": [
      "Biceps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 32,
    "name": "Face Pull",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Rope at face height",
      "Pull to forehead",
      "Rotate elbows out"
    ],
    "secondaryMuscles": [
      "Rear Delts",
      "Traps"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Face_Pull/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Face_Pull/1.jpg"
    ]
  },
  {
    "id": 33,
    "name": "Back Extension",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Hinge at hips",
      "Raise torso until straight",
      "Squeeze lower back"
    ],
    "secondaryMuscles": [
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 34,
    "name": "Superman",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Lie face down",
      "Lift arms and legs",
      "Hold and squeeze back"
    ],
    "secondaryMuscles": [
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Superman/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Superman/1.jpg"
    ]
  },
  {
    "id": 35,
    "name": "Good Mornings",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Bar on traps",
      "Hinge at hips",
      "Maintain flat back"
    ],
    "secondaryMuscles": [
      "Hamstrings"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 36,
    "name": "Rack Pulls",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Bar on pins",
      "Standard deadlift pull",
      "Focus on upper back"
    ],
    "secondaryMuscles": [
      "Traps",
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rack_Pulls/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rack_Pulls/1.jpg"
    ]
  },
  {
    "id": 37,
    "name": "Meadows Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Landmine setup",
      "Overhand grip",
      "Pull elbow high"
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 38,
    "name": "Single Arm Lat Pulldown",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Sit sideways",
      "Pull one handle down",
      "Focus on lat stretch"
    ],
    "secondaryMuscles": [
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 39,
    "name": "Inverted Row",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Hang under bar",
      "Pull chest to bar",
      "Keep body rigid"
    ],
    "secondaryMuscles": [
      "Biceps"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0499-bZGHsAZ.gif",
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Inverted_Row/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Inverted_Row/1.jpg"
    ]
  },
  {
    "id": 40,
    "name": "Straight Arm Pulldown",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Keep arms straight",
      "Pull bar to thighs",
      "Squeeze lats"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 41,
    "name": "Back Squat (High Bar)",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Bar on traps",
      "Feet shoulder width",
      "Squat deep",
      "Drive up"
    ],
    "secondaryMuscles": [
      "Glutes",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 42,
    "name": "Back Squat (Low Bar)",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Bar on rear delts",
      "Leaning forward more",
      "Drive with hips"
    ],
    "secondaryMuscles": [
      "Glutes",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 43,
    "name": "Front Squat",
    "muscleGroup": "Legs",
    "difficulty": "B",
    "instructions": [
      "Bar on front delts",
      "Upright torso",
      "Elbows high",
      "Squat deep"
    ],
    "secondaryMuscles": [
      "Core",
      "Quads"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 44,
    "name": "Goblet Squat",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Hold dumbbell at chest",
      "Elbows inside knees",
      "Squat deep"
    ],
    "secondaryMuscles": [
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Goblet_Squat/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Goblet_Squat/1.jpg"
    ]
  },
  {
    "id": 45,
    "name": "Leg Press",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Feet shoulder width",
      "Lower platform",
      "Don't lock knees at top"
    ],
    "secondaryMuscles": [
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Press/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Press/1.jpg"
    ]
  },
  {
    "id": 46,
    "name": "Hack Squat Machine",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Lean back in machine",
      "Squat deep",
      "Focus on quads"
    ],
    "secondaryMuscles": [
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 47,
    "name": "Walking Lunges",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Big step forward",
      "Drop back knee",
      "Keep torso upright"
    ],
    "secondaryMuscles": [
      "Glutes",
      "Balance"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 48,
    "name": "Bulgarian Split Squat",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "One foot on bench",
      "Squat on front leg",
      "Leaning forward for glutes"
    ],
    "secondaryMuscles": [
      "Glutes",
      "Balance"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 49,
    "name": "Romanian Deadlift",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Hinge at hips",
      "Bar along legs",
      "Feel hamstring stretch"
    ],
    "secondaryMuscles": [
      "Glutes",
      "Back"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift/1.jpg"
    ]
  },
  {
    "id": 50,
    "name": "Lying Leg Curl",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lie face down",
      "Curl legs up",
      "Squeeze hamstrings"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 51,
    "name": "Seated Leg Curl",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Sit upright",
      "Curl legs under",
      "Focus on contraction"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Leg_Curl/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Leg_Curl/1.jpg"
    ]
  },
  {
    "id": 52,
    "name": "Leg Extension",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Sit back",
      "Extend legs straight",
      "Squeeze quads"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 53,
    "name": "Stiff Leg Deadlift",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Legs almost straight",
      "Hinge deep",
      "Bar away from body slightly"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 54,
    "name": "Hip Thrust (Barbell)",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Back on bench",
      "Bar over hips",
      "Drive heels down",
      "Squeeze glutes"
    ],
    "secondaryMuscles": [
      "Hamstrings"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 55,
    "name": "Glute Bridge",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lie on floor",
      "Lift hips",
      "Squeeze glutes at top"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 56,
    "name": "Calf Raise (Standing)",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand on edge",
      "Rise on toes",
      "Full stretch at bottom"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 57,
    "name": "Calf Raise (Seated)",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Sit in machine",
      "Rise on toes",
      "Focus on soleus"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 58,
    "name": "Step-Ups",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Step onto box",
      "Drive through front heel",
      "Control descent"
    ],
    "secondaryMuscles": [
      "Glutes",
      "Balance"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 59,
    "name": "Sumo Squat (Dumbbell)",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Wide stance",
      "Dumbbell between legs",
      "Squat deep"
    ],
    "secondaryMuscles": [
      "Adductors",
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 60,
    "name": "Box Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Sit back to box",
      "Pause briefly",
      "Drive up explosively"
    ],
    "secondaryMuscles": [
      "Glutes",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Box_Squat/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Box_Squat/1.jpg"
    ]
  },
  {
    "id": 61,
    "name": "Overhead Press (Barbell)",
    "muscleGroup": "Shoulders",
    "difficulty": "C",
    "instructions": [
      "Stand tall",
      "Press bar overhead",
      "Keep core tight",
      "Lock out at top"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 62,
    "name": "Seated Dumbbell Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Sit with back support",
      "Dumbbells at ears",
      "Press up",
      "Squeeze at top"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Dumbbell_Press/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": 63,
    "name": "Arnold Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Palms face you",
      "Rotate while pressing",
      "Reverse on way down"
    ],
    "secondaryMuscles": [
      "Triceps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 64,
    "name": "Lateral Raise (Dumbbell)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Arms slightly bent",
      "Raise to shoulder height",
      "Lower slowly"
    ],
    "secondaryMuscles": [
      "Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 65,
    "name": "Lateral Raise (Cable)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Cable low",
      "Pull across body",
      "Constant tension"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 66,
    "name": "Front Raise (Dumbbell)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Raise weights in front",
      "Stop at shoulder level",
      "Alternate arms"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 67,
    "name": "Front Raise (Plate)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Hold plate",
      "Raise to eye level",
      "Lower with control"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 68,
    "name": "Rear Delt Fly (Dumbbell)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Bend 45 degrees",
      "Raise arms to sides",
      "Squeeze rear delts"
    ],
    "secondaryMuscles": [
      "Upper Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 69,
    "name": "Reverse Pec Deck",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Sit facing machine",
      "Push handles back",
      "Squeeze rear delts"
    ],
    "secondaryMuscles": [
      "Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 70,
    "name": "Upright Row (Barbell)",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Grip bar narrow",
      "Pull to chin",
      "Elbows lead the way"
    ],
    "secondaryMuscles": [
      "Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 71,
    "name": "Shrugs (Barbell)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Hold bar at thighs",
      "Lift shoulders to ears",
      "Squeeze traps"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 72,
    "name": "Shrugs (Dumbbell)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Dumbbells at sides",
      "Lift shoulders",
      "Hold and squeeze"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 73,
    "name": "Push Press",
    "muscleGroup": "Shoulders",
    "difficulty": "B",
    "instructions": [
      "Dip knees",
      "Drive bar overhead",
      "Use leg power"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Legs"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Press/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Press/1.jpg"
    ]
  },
  {
    "id": 74,
    "name": "Handstand Push-Up",
    "muscleGroup": "Shoulders",
    "difficulty": "A",
    "instructions": [
      "Balance against wall",
      "Lower head to floor",
      "Press back up"
    ],
    "secondaryMuscles": [
      "Triceps",
      "Core"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0471-rQxwMxO.gif",
    "imageUrls": []
  },
  {
    "id": 75,
    "name": "Face Pull (High Cable)",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Pull rope to forehead",
      "External rotation",
      "Squeeze rear delts"
    ],
    "secondaryMuscles": [
      "Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 76,
    "name": "Barbell Bicep Curl",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand with bar",
      "Curl to chest",
      "Keep elbows still"
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 77,
    "name": "EZ Bar Curl",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "EZ bar for wrists",
      "Curl up",
      "Full extension"
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 78,
    "name": "Dumbbell Bicep Curl",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Alternate arms",
      "Rotate palms up",
      "Squeeze at top"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bicep_Curl/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bicep_Curl/1.jpg"
    ]
  },
  {
    "id": 79,
    "name": "Hammer Curl",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Neutral grip",
      "Curl up",
      "Targets brachialis"
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 80,
    "name": "Preacher Curl",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Arms on pad",
      "Curl up",
      "Prevents cheating"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Preacher_Curl/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Preacher_Curl/1.jpg"
    ]
  },
  {
    "id": 81,
    "name": "Concentration Curl",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Sit on bench",
      "Elbow against leg",
      "Curl dumbbell"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 82,
    "name": "Cable Bicep Curl",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Low cable",
      "Constant tension",
      "Curl up"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 83,
    "name": "Spider Curl",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Lean on incline bench",
      "Arms hang down",
      "Curl up"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Spider_Curl/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Spider_Curl/1.jpg"
    ]
  },
  {
    "id": 84,
    "name": "Tricep Rope Pushdown",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "High cable",
      "Press down",
      "Split rope at bottom"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 85,
    "name": "Tricep Straight Bar Pushdown",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "High cable",
      "Press bar down",
      "Lock out triceps"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 86,
    "name": "Skull Crushers (EZ Bar)",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Lie on bench",
      "Lower bar to forehead",
      "Extend back up"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 87,
    "name": "Overhead Dumbbell Extension",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Weight behind head",
      "Extend arms up",
      "Keep elbows tucked"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 88,
    "name": "Dips (Tricep Focus)",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Upright torso",
      "Lower slowly",
      "Lock out at top"
    ],
    "secondaryMuscles": [
      "Chest"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 89,
    "name": "Close Grip Bench Press",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Grip shoulder width",
      "Lower to chest",
      "Press up focusing on triceps"
    ],
    "secondaryMuscles": [
      "Chest"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 90,
    "name": "Tricep Kickback (Dumbbell)",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Lean forward",
      "Extend arm back",
      "Squeeze tricep"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 91,
    "name": "Tricep Kickback (Cable)",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Cable handle",
      "Extend arm back",
      "Slow return"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 92,
    "name": "Reverse Grip Tricep Pushdown",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Underhand grip",
      "Press down",
      "Targets medial head"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 93,
    "name": "Single Arm Overhead Extension",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "One dumbbell",
      "Lower behind head",
      "Extend up"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 94,
    "name": "Bench Dips",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Hands on bench",
      "Feet on floor",
      "Lower hips",
      "Press up"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bench_Dips/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bench_Dips/1.jpg"
    ]
  },
  {
    "id": 95,
    "name": "Zottman Curl",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Curl up palms up",
      "Rotate palms down",
      "Lower slowly"
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Zottman_Curl/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Zottman_Curl/1.jpg"
    ]
  },
  {
    "id": 96,
    "name": "Plank",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Forearms on floor",
      "Body straight",
      "Hold position"
    ],
    "secondaryMuscles": [
      "Shoulders"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plank/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plank/1.jpg"
    ]
  },
  {
    "id": 97,
    "name": "Side Plank",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "One forearm",
      "Body sideways",
      "Hold and switch sides"
    ],
    "secondaryMuscles": [
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 98,
    "name": "Hanging Leg Raise",
    "muscleGroup": "Core",
    "difficulty": "C",
    "instructions": [
      "Hang from bar",
      "Raise legs to 90 degrees",
      "Lower slowly"
    ],
    "secondaryMuscles": [
      "Hip Flexors"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0472-I3tsCnC.gif",
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hanging_Leg_Raise/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hanging_Leg_Raise/1.jpg"
    ]
  },
  {
    "id": 99,
    "name": "Captain's Chair Leg Raise",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Back against pad",
      "Raise knees",
      "Squeeze abs"
    ],
    "secondaryMuscles": [
      "Hip Flexors"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 100,
    "name": "Ab Wheel Rollout",
    "muscleGroup": "Core",
    "difficulty": "C",
    "instructions": [
      "Kneel down",
      "Roll wheel forward",
      "Pull back with abs"
    ],
    "secondaryMuscles": [
      "Lats",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 101,
    "name": "Cable Crunch",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Kneel facing cable",
      "Pull rope to floor",
      "Curl your spine"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Crunch/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Crunch/1.jpg"
    ]
  },
  {
    "id": 102,
    "name": "Russian Twist",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Sit with feet up",
      "Rotate side to side",
      "Touch weight to floor"
    ],
    "secondaryMuscles": [
      "Obliques"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0687-XVDdcoj.gif",
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Russian_Twist/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Russian_Twist/1.jpg"
    ]
  },
  {
    "id": 103,
    "name": "Bicycle Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie on back",
      "Elbow to opposite knee",
      "Pedal legs"
    ],
    "secondaryMuscles": [
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 104,
    "name": "Leg Raises (Floor)",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie on back",
      "Raise legs straight up",
      "Lower without touching floor"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 105,
    "name": "V-Ups",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie flat",
      "Touch toes and hands at top",
      "V-shape body"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 106,
    "name": "Dead Bug",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie on back",
      "Opposite arm/leg extension",
      "Keep back flat"
    ],
    "secondaryMuscles": [],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0276-iny3m5y.gif",
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dead_Bug/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dead_Bug/1.jpg"
    ]
  },
  {
    "id": 107,
    "name": "Bird Dog",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "On all fours",
      "Extend opposite arm/leg",
      "Balance and squeeze"
    ],
    "secondaryMuscles": [
      "Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 108,
    "name": "Woodchopper (Cable)",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Cable at shoulder height",
      "Rotate and pull across",
      "Pivot feet"
    ],
    "secondaryMuscles": [
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 109,
    "name": "Hollow Body Hold",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie on back",
      "Lift head and legs",
      "Curve body like banana"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 110,
    "name": "Dragon Flag",
    "muscleGroup": "Core",
    "difficulty": "A",
    "instructions": [
      "Grip bench behind head",
      "Raise body straight",
      "Lower slowly as one unit"
    ],
    "secondaryMuscles": [
      "Full Body"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 201,
    "name": "Downward Dog",
    "muscleGroup": "Full Body",
    "difficulty": "E",
    "instructions": [
      "Hands and feet on floor",
      "Hips to ceiling",
      "V-shape"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Shoulders"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 202,
    "name": "Cobra Pose",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie face down",
      "Lift chest",
      "Arch back"
    ],
    "secondaryMuscles": [
      "Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 203,
    "name": "Warrior I",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lunge forward",
      "Arms up",
      "Back foot at 45 degrees"
    ],
    "secondaryMuscles": [
      "Shoulders"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 204,
    "name": "Warrior II",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lunge forward",
      "Arms to sides",
      "Look over front hand"
    ],
    "secondaryMuscles": [
      "Shoulders"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 205,
    "name": "Tree Pose",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand on one leg",
      "Foot on inner thigh",
      "Hands at chest"
    ],
    "secondaryMuscles": [
      "Balance"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 206,
    "name": "Child's Pose",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Kneel and sit on heels",
      "Reach forward",
      "Rest forehead"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 207,
    "name": "Cat-Cow",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "On all fours",
      "Arch back up",
      "Then arch down",
      "Synchronize breath"
    ],
    "secondaryMuscles": [
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 208,
    "name": "Pigeon Pose",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "One leg forward bent",
      "Back leg straight",
      "Lean forward"
    ],
    "secondaryMuscles": [
      "Glutes"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 209,
    "name": "Crow Pose",
    "muscleGroup": "Arms",
    "difficulty": "C",
    "instructions": [
      "Hands on floor",
      "Knees on triceps",
      "Balance forward"
    ],
    "secondaryMuscles": [
      "Core",
      "Shoulders"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 210,
    "name": "Triangle Pose",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Wide stance",
      "Reach for foot",
      "Other arm up"
    ],
    "secondaryMuscles": [
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 301,
    "name": "Burpees",
    "muscleGroup": "Full Body",
    "difficulty": "D",
    "instructions": [
      "Drop to push-up",
      "Jump feet in",
      "Jump up explosively"
    ],
    "secondaryMuscles": [
      "Heart Rate"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 302,
    "name": "Mountain Climbers",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Push-up position",
      "Drive knees to chest",
      "Fast alternating"
    ],
    "secondaryMuscles": [
      "Shoulders"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Mountain_Climbers/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Mountain_Climbers/1.jpg"
    ]
  },
  {
    "id": 303,
    "name": "Jumping Jacks",
    "muscleGroup": "Full Body",
    "difficulty": "E",
    "instructions": [
      "Jump legs out",
      "Arms overhead",
      "Jump back"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 304,
    "name": "High Knees",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Run in place",
      "Lift knees high",
      "Fast pace"
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 305,
    "name": "Box Jumps",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Jump onto box",
      "Land softly",
      "Step down"
    ],
    "secondaryMuscles": [
      "Explosiveness"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 306,
    "name": "Battle Ropes",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Wave ropes",
      "Fast alternating",
      "Keep core tight"
    ],
    "secondaryMuscles": [
      "Shoulders",
      "Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 307,
    "name": "Jump Rope",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stay on toes",
      "Small jumps",
      "Consistent rhythm"
    ],
    "secondaryMuscles": [
      "Cardio"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/2612-e1e76I2.gif",
    "imageUrls": []
  },
  {
    "id": 308,
    "name": "Kettlebell Swing",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Hinge at hips",
      "Swing bell to eye level",
      "Drive with glutes"
    ],
    "secondaryMuscles": [
      "Legs",
      "Shoulders"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0549-UHJlbu3.gif",
    "imageUrls": []
  },
  {
    "id": 309,
    "name": "Medicine Ball Slam",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lift ball overhead",
      "Slam down hard",
      "Use full body"
    ],
    "secondaryMuscles": [
      "Arms",
      "Shoulders"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 310,
    "name": "Sled Push",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Lean into sled",
      "Drive with legs",
      "Maintain straight back"
    ],
    "secondaryMuscles": [
      "Full Body"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Sled_Push/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Sled_Push/1.jpg"
    ]
  },
  {
    "id": 400,
    "name": "Resistance Band Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Resistance Band and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 401,
    "name": "Kettlebell Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Kettlebell and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 402,
    "name": "TRX Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your TRX and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 403,
    "name": "Medicine Ball Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Medicine Ball and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 404,
    "name": "Sandbag Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Sandbag and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 405,
    "name": "Single Leg Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Single Leg and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 406,
    "name": "Single Arm Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Single Arm and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 407,
    "name": "Alternating Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Alternating and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 408,
    "name": "Weighted Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Weighted and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 409,
    "name": "Paused Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Paused and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 410,
    "name": "Tempo Bench Press",
    "muscleGroup": "Chest",
    "difficulty": "D",
    "instructions": [
      "Set up your Tempo and lie flat on your back.",
      "Grip the weight firmly, slightly wider than shoulder-width.",
      "Lower the weight with control to your mid-chest level, keeping elbows at a 45-degree angle.",
      "Press the weight back up explosively until your arms are fully extended."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 411,
    "name": "Resistance Band Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Resistance Band at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 412,
    "name": "Kettlebell Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Kettlebell at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 413,
    "name": "TRX Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the TRX at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 414,
    "name": "Medicine Ball Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Medicine Ball at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 415,
    "name": "Sandbag Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Sandbag at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 416,
    "name": "Single Leg Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Single Leg at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 417,
    "name": "Single Arm Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Single Arm at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 418,
    "name": "Alternating Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Alternating at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 419,
    "name": "Weighted Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Weighted at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 420,
    "name": "Paused Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Paused at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 421,
    "name": "Tempo Shoulder Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Tempo at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 422,
    "name": "Resistance Band Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Resistance Band.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 423,
    "name": "Kettlebell Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Kettlebell.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 424,
    "name": "TRX Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the TRX.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 425,
    "name": "Medicine Ball Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Medicine Ball.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 426,
    "name": "Sandbag Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Sandbag.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 427,
    "name": "Single Leg Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Single Leg.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 428,
    "name": "Single Arm Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Single Arm.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 429,
    "name": "Alternating Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Alternating.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 430,
    "name": "Weighted Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Weighted.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0852-JZuApnB.gif",
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Weighted_Squat/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Weighted_Squat/1.jpg"
    ]
  },
  {
    "id": 431,
    "name": "Paused Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Paused.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 432,
    "name": "Tempo Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Tempo.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 433,
    "name": "Resistance Band Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Resistance Band close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 434,
    "name": "Kettlebell Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Kettlebell close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 435,
    "name": "TRX Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the TRX close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 436,
    "name": "Medicine Ball Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Medicine Ball close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 437,
    "name": "Sandbag Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Sandbag close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 438,
    "name": "Single Leg Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Single Leg close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 439,
    "name": "Single Arm Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Single Arm close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 440,
    "name": "Alternating Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Alternating close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 441,
    "name": "Weighted Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Weighted close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 442,
    "name": "Paused Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Paused close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 443,
    "name": "Tempo Deadlift",
    "muscleGroup": "Back",
    "difficulty": "C",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Tempo close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 444,
    "name": "Resistance Band Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Resistance Band.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 445,
    "name": "Kettlebell Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Kettlebell.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 446,
    "name": "TRX Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the TRX.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 447,
    "name": "Medicine Ball Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Medicine Ball.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 448,
    "name": "Sandbag Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Sandbag.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 449,
    "name": "Single Leg Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Single Leg.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 450,
    "name": "Single Arm Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Single Arm.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 451,
    "name": "Alternating Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Alternating.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 452,
    "name": "Weighted Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Weighted.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 453,
    "name": "Paused Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Paused.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 454,
    "name": "Tempo Lunges",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Tempo.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 455,
    "name": "Resistance Band Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Resistance Band securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 456,
    "name": "Kettlebell Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Kettlebell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 457,
    "name": "TRX Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the TRX securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 458,
    "name": "Medicine Ball Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Medicine Ball securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 459,
    "name": "Sandbag Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Sandbag securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 460,
    "name": "Single Leg Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Single Leg securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 461,
    "name": "Single Arm Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Single Arm securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 462,
    "name": "Alternating Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Alternating securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 463,
    "name": "Weighted Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Weighted securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 464,
    "name": "Paused Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Paused securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 465,
    "name": "Tempo Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Tempo securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 466,
    "name": "Resistance Band Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Resistance Band with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 467,
    "name": "Kettlebell Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Kettlebell with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 468,
    "name": "TRX Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the TRX with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 469,
    "name": "Medicine Ball Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Medicine Ball with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 470,
    "name": "Sandbag Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Sandbag with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 471,
    "name": "Single Leg Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Single Leg with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 472,
    "name": "Single Arm Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Single Arm with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 473,
    "name": "Alternating Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Alternating with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 474,
    "name": "Weighted Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Weighted with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 475,
    "name": "Paused Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Paused with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 476,
    "name": "Tempo Bicep Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Tempo with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 477,
    "name": "Resistance Band Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Resistance Band securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 478,
    "name": "Kettlebell Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Kettlebell securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 479,
    "name": "TRX Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the TRX securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 480,
    "name": "Medicine Ball Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Medicine Ball securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 481,
    "name": "Sandbag Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Sandbag securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 482,
    "name": "Single Leg Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Single Leg securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 483,
    "name": "Single Arm Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Single Arm securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 484,
    "name": "Alternating Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Alternating securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 485,
    "name": "Weighted Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Weighted securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 486,
    "name": "Paused Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Paused securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 487,
    "name": "Tempo Tricep Extensions",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Tempo securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 488,
    "name": "Resistance Band Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 489,
    "name": "Kettlebell Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 490,
    "name": "TRX Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 491,
    "name": "Medicine Ball Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 492,
    "name": "Sandbag Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 493,
    "name": "Single Leg Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 494,
    "name": "Single Arm Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 495,
    "name": "Alternating Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 496,
    "name": "Weighted Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Weighted_Crunches/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Weighted_Crunches/1.jpg"
    ]
  },
  {
    "id": 497,
    "name": "Paused Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 498,
    "name": "Tempo Crunches",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 499,
    "name": "Resistance Band Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 500,
    "name": "Kettlebell Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 501,
    "name": "TRX Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 502,
    "name": "Medicine Ball Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 503,
    "name": "Sandbag Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 504,
    "name": "Single Leg Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 505,
    "name": "Single Arm Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 506,
    "name": "Alternating Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 507,
    "name": "Weighted Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 508,
    "name": "Paused Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 509,
    "name": "Tempo Leg Raises",
    "muscleGroup": "Core",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 510,
    "name": "Resistance Band Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 511,
    "name": "Kettlebell Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 512,
    "name": "TRX Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 513,
    "name": "Medicine Ball Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 514,
    "name": "Sandbag Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 515,
    "name": "Single Leg Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 516,
    "name": "Single Arm Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 517,
    "name": "Alternating Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 518,
    "name": "Weighted Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 519,
    "name": "Paused Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 520,
    "name": "Tempo Plank Variations",
    "muscleGroup": "Core",
    "difficulty": "D",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 521,
    "name": "Dumbbell Skull Crushers",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Dumbbell securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 522,
    "name": "Barbell Skull Crushers",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Barbell securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 523,
    "name": "Cable Skull Crushers",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Cable securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 524,
    "name": "Machine Skull Crushers",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Machine securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 525,
    "name": "Smith Machine Skull Crushers",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Smith Machine securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 526,
    "name": "Dumbbell Preacher Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Dumbbell with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 527,
    "name": "Barbell Preacher Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Barbell with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 528,
    "name": "Cable Preacher Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Cable with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 529,
    "name": "Machine Preacher Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Machine with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Preacher_Curls/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Preacher_Curls/1.jpg"
    ]
  },
  {
    "id": 530,
    "name": "Smith Machine Preacher Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Smith Machine with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 531,
    "name": "Dumbbell Lat Pulldowns",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Dumbbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 532,
    "name": "Barbell Lat Pulldowns",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Barbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 533,
    "name": "Cable Lat Pulldowns",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Cable securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 534,
    "name": "Machine Lat Pulldowns",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 535,
    "name": "Smith Machine Lat Pulldowns",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Smith Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 536,
    "name": "Dumbbell Seated Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Dumbbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 537,
    "name": "Barbell Seated Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Barbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 538,
    "name": "Cable Seated Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Cable securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 539,
    "name": "Machine Seated Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 540,
    "name": "Smith Machine Seated Rows",
    "muscleGroup": "Back",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Smith Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 541,
    "name": "Dumbbell Face Pulls",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Set up the Dumbbell and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 542,
    "name": "Barbell Face Pulls",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Set up the Barbell and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 543,
    "name": "Cable Face Pulls",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Set up the Cable and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 544,
    "name": "Machine Face Pulls",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Set up the Machine and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 545,
    "name": "Smith Machine Face Pulls",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Set up the Smith Machine and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 546,
    "name": "Dumbbell Lateral Raises",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 547,
    "name": "Barbell Lateral Raises",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 548,
    "name": "Cable Lateral Raises",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 549,
    "name": "Machine Lateral Raises",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 550,
    "name": "Smith Machine Lateral Raises",
    "muscleGroup": "Shoulders",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 551,
    "name": "Dumbbell Calf Raises",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 552,
    "name": "Barbell Calf Raises",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 553,
    "name": "Cable Calf Raises",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 554,
    "name": "Machine Calf Raises",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 555,
    "name": "Smith Machine Calf Raises",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Lie or position yourself on the floor/mat.",
      "Engage your core muscles to perform the contraction or hold.",
      "Control the movement, avoiding momentum and neck strain.",
      "Slowly return to the starting position, keeping tension on your core."
    ],
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 556,
    "name": "Dumbbell Leg Extensions",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Dumbbell securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 557,
    "name": "Barbell Leg Extensions",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Barbell securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 558,
    "name": "Cable Leg Extensions",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Cable securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 559,
    "name": "Machine Leg Extensions",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Machine securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 560,
    "name": "Smith Machine Leg Extensions",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Position yourself and grip the Smith Machine securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 561,
    "name": "Dumbbell Leg Curls",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Dumbbell with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 562,
    "name": "Barbell Leg Curls",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Barbell with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 563,
    "name": "Cable Leg Curls",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Cable with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 564,
    "name": "Machine Leg Curls",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Machine with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 565,
    "name": "Smith Machine Leg Curls",
    "muscleGroup": "Legs",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Smith Machine with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 566,
    "name": "Dumbbell Hammer Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Dumbbell with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 567,
    "name": "Barbell Hammer Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Barbell with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 568,
    "name": "Cable Hammer Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Cable with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 569,
    "name": "Machine Hammer Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Machine with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 570,
    "name": "Smith Machine Hammer Curls",
    "muscleGroup": "Arms",
    "difficulty": "E",
    "instructions": [
      "Stand or sit upright, holding the Smith Machine with a firm grip.",
      "Pin your elbows to your sides and curl the weight upwards toward your chest.",
      "Squeeze your biceps hard at the top of the movement.",
      "Lower the weight slowly to the starting position, fully extending your arms."
    ],
    "secondaryMuscles": [
      "Forearms"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 571,
    "name": "Dumbbell Dips",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Dumbbell securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 572,
    "name": "Barbell Dips",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Barbell securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 573,
    "name": "Cable Dips",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Cable securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 574,
    "name": "Machine Dips",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Machine securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 575,
    "name": "Smith Machine Dips",
    "muscleGroup": "Arms",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Smith Machine securely.",
      "Extend your arms to push or pull the weight, moving only at the elbows.",
      "Squeeze your triceps forcefully at the point of full extension.",
      "Slowly return the weight to the starting position, keeping your upper arms stationary."
    ],
    "secondaryMuscles": [
      "Chest",
      "Front Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 576,
    "name": "Dumbbell Pushups",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Set up the Dumbbell and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 577,
    "name": "Barbell Pushups",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Set up the Barbell and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 578,
    "name": "Cable Pushups",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Set up the Cable and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 579,
    "name": "Machine Pushups",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Set up the Machine and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 580,
    "name": "Smith Machine Pushups",
    "muscleGroup": "Chest",
    "difficulty": "E",
    "instructions": [
      "Set up the Smith Machine and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 581,
    "name": "Dumbbell Pullups",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Dumbbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 582,
    "name": "Barbell Pullups",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Barbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 583,
    "name": "Cable Pullups",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Cable securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 584,
    "name": "Machine Pullups",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 585,
    "name": "Smith Machine Pullups",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Smith Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 586,
    "name": "Dumbbell Barbell Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Dumbbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 587,
    "name": "Barbell Barbell Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Barbell securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 588,
    "name": "Cable Barbell Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Cable securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 589,
    "name": "Machine Barbell Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 590,
    "name": "Smith Machine Barbell Row",
    "muscleGroup": "Back",
    "difficulty": "D",
    "instructions": [
      "Position yourself and grip the Smith Machine securely.",
      "Pull the weight (or pull your body) towards your chest/waist, leading with your elbows.",
      "Focus on squeezing your shoulder blades together at the peak contraction.",
      "Extend your arms back to the starting position under complete control."
    ],
    "secondaryMuscles": [
      "Biceps",
      "Rear Delts"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 591,
    "name": "Dumbbell Overhead Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Dumbbell at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 592,
    "name": "Barbell Overhead Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Barbell at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 593,
    "name": "Cable Overhead Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Cable at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 594,
    "name": "Machine Overhead Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Machine at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 595,
    "name": "Smith Machine Overhead Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Smith Machine at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 596,
    "name": "Dumbbell Front Squat",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Dumbbell.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 597,
    "name": "Barbell Front Squat",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Barbell.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0042-zG0zs85.gif",
    "imageUrls": []
  },
  {
    "id": 598,
    "name": "Cable Front Squat",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Cable.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 599,
    "name": "Machine Front Squat",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Machine.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 600,
    "name": "Smith Machine Front Squat",
    "muscleGroup": "Legs",
    "difficulty": "C",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Smith Machine.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 601,
    "name": "Dumbbell RDL",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Dumbbell close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 602,
    "name": "Barbell RDL",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Barbell close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 603,
    "name": "Cable RDL",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Cable close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 604,
    "name": "Machine RDL",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Machine close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 605,
    "name": "Smith Machine RDL",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand with feet hip-width apart. Keep the Smith Machine close to your shins/body.",
      "Hinge at your hips and bend your knees slightly to reach the weight.",
      "Keep your spine neutral, shoulder blades pulled back, and core braced.",
      "Push through your feet to stand up straight, locking out your hips at the top."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Lower Back"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 606,
    "name": "Dumbbell Hip Thrust",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Set up the Dumbbell and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 607,
    "name": "Barbell Hip Thrust",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Set up the Barbell and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": [
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Hip_Thrust/0.jpg",
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Hip_Thrust/1.jpg"
    ]
  },
  {
    "id": 608,
    "name": "Cable Hip Thrust",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Set up the Cable and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 609,
    "name": "Machine Hip Thrust",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Set up the Machine and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 610,
    "name": "Smith Machine Hip Thrust",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Set up the Smith Machine and assume the starting stance.",
      "Execute the movement through a full range of motion with control.",
      "Squeeze the target muscles at the peak of the contraction.",
      "Return to the starting position slowly, keeping tension on the muscle."
    ],
    "secondaryMuscles": [],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 611,
    "name": "Dumbbell Bulgarian Split Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Dumbbell.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 612,
    "name": "Barbell Bulgarian Split Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Barbell.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 613,
    "name": "Cable Bulgarian Split Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Cable.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 614,
    "name": "Machine Bulgarian Split Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Machine.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 615,
    "name": "Smith Machine Bulgarian Split Squat",
    "muscleGroup": "Legs",
    "difficulty": "D",
    "instructions": [
      "Stand upright with feet shoulder-width apart, holding the Smith Machine.",
      "Lower your body by hinging your hips back and bending your knees, as if sitting in a chair.",
      "Keep your chest up, back straight, and knees aligned with your toes.",
      "Drive through your heels to return to the standing position."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 616,
    "name": "Dumbbell Arnold Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Dumbbell at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/2137-Xy4jlWA.gif",
    "imageUrls": []
  },
  {
    "id": 617,
    "name": "Barbell Arnold Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Barbell at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 618,
    "name": "Cable Arnold Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Cable at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 619,
    "name": "Machine Arnold Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Machine at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 620,
    "name": "Smith Machine Arnold Press",
    "muscleGroup": "Shoulders",
    "difficulty": "D",
    "instructions": [
      "Hold the Smith Machine at shoulder height with your palms facing forward.",
      "Brace your core and press the weight directly overhead until your elbows lock out.",
      "Ensure you do not arch your lower back during the lift.",
      "Lower the weight back down to your shoulders with control."
    ],
    "secondaryMuscles": [
      "Triceps",
      "Upper Traps"
    ],
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10001,
    "name": "Wall Angel",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Stand with back, head, and hips flat against a wall.",
      "Place arms on the wall in a W shape (elbows bent 90 degrees).",
      "Slide your arms up the wall until they are straight overhead.",
      "Keep your elbows and hands in contact with the wall at all times.",
      "Slowly return to the starting W shape and repeat."
    ],
    "secondaryMuscles": [
      "Shoulders",
      "Upper Back"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/posture-exercises#wall-angels",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10002,
    "name": "Chin Tuck",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Sit up straight and look straight ahead.",
      "Place a finger on your chin.",
      "Without tilting your head, pull your chin back (create a double chin) away from your finger.",
      "Hold the position for 5 seconds.",
      "Relax your chin forward and repeat."
    ],
    "secondaryMuscles": [
      "Neck"
    ],
    "isCorrective": true,
    "externalLink": "https://www.medicalnewstoday.com/articles/chin-tucks",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10003,
    "name": "Doorway Pec Stretch",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Stand in an open doorway.",
      "Raise your arms up to the sides, bent at 90-degree angles with your forearms resting on the doorframe.",
      "Slowly step forward with one foot until you feel a stretch in your chest.",
      "Hold the stretch for 30 seconds.",
      "Step back, relax, and repeat."
    ],
    "secondaryMuscles": [
      "Chest",
      "Shoulders"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/doorway-stretch",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10004,
    "name": "Kneeling Hip Flexor Stretch",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Kneel on your right knee, with your left foot flat on the floor in front of you (90-degree angles).",
      "Keep your back straight and squeeze your right glute.",
      "Gently shift your weight forward until you feel a stretch in the front of your right hip.",
      "Hold for 30 seconds.",
      "Switch sides and repeat."
    ],
    "secondaryMuscles": [
      "Legs"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/hip-flexor-stretches",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10005,
    "name": "Clamshell",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Lie on your side with hips and knees bent to 90 degrees, feet stacked.",
      "Keep your feet glued together as you slowly raise your top knee toward the ceiling.",
      "Do not rotate your hips or lower back; use your glute to lift.",
      "Hold for 1 second at the top, then slowly lower your knee.",
      "Perform all reps, then switch sides."
    ],
    "secondaryMuscles": [
      "Glutes"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/clamshell-exercise",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10006,
    "name": "Couch Stretch",
    "muscleGroup": "Corrective",
    "difficulty": "D",
    "instructions": [
      "Place your back knee against a wall or couch, pointing your shin straight up.",
      "Step your opposite leg forward into a lunge stance with your foot flat.",
      "Slowly bring your torso upright, squeezing your glutes to stretch the hip flexors/quad.",
      "Hold for 30-60 seconds while breathing deeply.",
      "Switch legs and repeat."
    ],
    "secondaryMuscles": [
      "Legs",
      "Quads"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/couch-stretch",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10007,
    "name": "Serratus Push-Up+",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Get into a push-up or forearm plank position, keeping your body in a straight line.",
      "Without bending your elbows, let your chest sink down toward the floor, pinching your shoulder blades together.",
      "Push through your hands/forearms to raise your upper back as high as possible, rounding the upper back slightly at the top.",
      "Hold the top position for 2 seconds.",
      "Repeat with slow, controlled movements."
    ],
    "secondaryMuscles": [
      "Chest",
      "Shoulders"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/serratus-anterior-exercises",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10008,
    "name": "Deep Neck Flexor Hold",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Lie on your back on a flat surface without a pillow.",
      "Perform a chin tuck (pull chin straight down toward floor).",
      "Lift your head slightly (about 1 inch) off the floor while maintaining the chin tuck.",
      "Hold this position for 10-15 seconds, focusing on front neck muscles.",
      "Lower head slowly and relax."
    ],
    "secondaryMuscles": [
      "Neck"
    ],
    "isCorrective": true,
    "externalLink": "https://www.spine-health.com/wellness/ergonomics/chin-tuck-exercise-neck-pain",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10009,
    "name": "Levator Scapulae Stretch",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Sit upright and place your right hand behind your head.",
      "Place your left hand behind your back or hold onto the bottom of your chair.",
      "Gently pull your head down and look diagonally toward your right armpit.",
      "Hold the stretch for 30 seconds when you feel it in the back/side of your neck.",
      "Repeat on the opposite side."
    ],
    "secondaryMuscles": [
      "Neck",
      "Shoulders"
    ],
    "isCorrective": true,
    "externalLink": "https://www.spine-health.com/wellness/exercise/easy-levator-scapulae-stretches",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10010,
    "name": "Standing Hamstring Stretch",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Place one heel on a slightly elevated surface (like a low step).",
      "Keep your leg straight, foot flexed toward the ceiling.",
      "Keep your back straight and hinge forward at your hips until you feel a stretch behind your thigh.",
      "Hold the stretch for 30 seconds.",
      "Switch sides and repeat."
    ],
    "secondaryMuscles": [
      "Legs"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/hamstring-stretches",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10011,
    "name": "Lateral Band Walk",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Place a mini resistance band around your ankles or just above your knees.",
      "Step your feet out to shoulder-width, creating tension on the band, and lower into a half-squat.",
      "Take a controlled step sideways with one foot, then follow with the other foot (keep band tense).",
      "Repeat steps in one direction, then walk back the other way."
    ],
    "secondaryMuscles": [
      "Glutes",
      "Legs"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/lateral-band-walk",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10012,
    "name": "IT Band Foam Roll",
    "muscleGroup": "Corrective",
    "difficulty": "D",
    "instructions": [
      "Lie on your side with a foam roller positioned under your bottom hip.",
      "Cross your top leg over and place your top foot flat on the floor for support.",
      "Slowly roll your outer thigh from just below your hip to just above your knee.",
      "Pause on tender spots for 20-30 seconds.",
      "Switch sides and repeat."
    ],
    "secondaryMuscles": [
      "Legs"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/foam-roller-it-band",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10013,
    "name": "Side-Lying Leg Raise",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Lie on your side with legs straight and stacked.",
      "Slowly raise your top leg upward (about 45 degrees), keeping your heel slightly back and foot flexed.",
      "Hold for 1 second at the top, then slowly lower your leg.",
      "Focus on using your side hip/glute muscles.",
      "Perform reps, then switch sides."
    ],
    "secondaryMuscles": [
      "Glutes"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/side-lying-leg-lift",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10014,
    "name": "Towel Foot Scrunch",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Sit on a chair with your feet flat on the floor, on top of a flat towel.",
      "Using only your toes, scrunch the towel up toward your heels.",
      "Hold the scrunch for 2 seconds, then release your toes.",
      "Repeat until you have scrunched the length of the towel.",
      "Switch feet and repeat."
    ],
    "secondaryMuscles": [
      "Feet"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/flat-feet-exercises",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10015,
    "name": "Short Foot Arch Lift",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Sit or stand with feet flat on the floor.",
      "Without curling your toes, attempt to pull the ball of your foot toward your heel.",
      "Your foot arch should lift off the floor as your foot gets shorter.",
      "Hold the contraction for 5 seconds.",
      "Relax and repeat."
    ],
    "secondaryMuscles": [
      "Feet"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/short-foot-exercise",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10016,
    "name": "Thoracic Roller Extension",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Lie on your back with a foam roller placed under your mid-back (thoracic spine).",
      "Support your head with your hands, keeping your hips flat on the floor.",
      "Gently lean backward over the roller, extending your upper back.",
      "Hold the extension for 5-10 seconds, then lift up slightly.",
      "Move the roller slightly up/down and repeat."
    ],
    "secondaryMuscles": [
      "Back",
      "Shoulders"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/foam-roller-back-extension",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10017,
    "name": "Single-Leg Balance",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Stand with feet hip-width apart, arms at your sides.",
      "Shift your weight to one foot and lift the opposite foot off the floor.",
      "Maintain your balance, keeping your hips level and core braced.",
      "Hold for 30-60 seconds.",
      "Switch sides and repeat. Close eyes for added difficulty."
    ],
    "secondaryMuscles": [
      "Legs",
      "Core"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/balance-exercises",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10018,
    "name": "Band Pull-Apart",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Stand upright, holding a resistance band in front of you at shoulder height.",
      "Keep your arms straight and pull the band apart, squeezing your shoulder blades together.",
      "The band should touch your chest at the end of the movement.",
      "Slowly return to the start position with control."
    ],
    "secondaryMuscles": [
      "Shoulders",
      "Upper Back"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/band-pull-apart",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10019,
    "name": "Band External Rotation",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Hold a resistance band with both hands, palms up, elbows bent to 90 degrees by your sides.",
      "Keep your elbows pinned to your ribs and rotate your hands outward.",
      "Squeeze the back of your shoulders at the outer limit.",
      "Slowly return to the starting position."
    ],
    "secondaryMuscles": [
      "Shoulders"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/shoulder-external-rotation",
    "gifUrl": null,
    "imageUrls": []
  },
  {
    "id": 10020,
    "name": "Scapular Wall Slide",
    "muscleGroup": "Corrective",
    "difficulty": "E",
    "instructions": [
      "Stand with your back, head, and elbows against a wall.",
      "Slide your shoulder blades down and back, squeezing them together.",
      "Slide your forearms up the wall slightly, keeping contact.",
      "Slowly pull elbows down, focusing on lower trap activation."
    ],
    "secondaryMuscles": [
      "Upper Back",
      "Shoulders"
    ],
    "isCorrective": true,
    "externalLink": "https://www.healthline.com/health/scapular-wall-slides",
    "gifUrl": null,
    "imageUrls": []
  }
];

export default exercises;
