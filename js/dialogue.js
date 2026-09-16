/**
 * THE FINAL SUNSET - Dialogue Script & Story Tree
 * Full narrative, choices, memory branches, and cinematic triggers for Chapters 1-11 + Ending.
 */

const STORY_DATA = {
  // --- CHAPTER 1: THE SILENT BOY ---
  chap1_intro: [
    { speaker: 'MPC', text: 'A peaceful morning in Tamil Nadu. The air is cool, carrying the gentle scent of wet leaves and distant temple bells.', portrait: 'narrator' },
    { speaker: 'MPC', text: 'RK walks alone toward school with his backpack, surrounded by the soft hum of the morning breeze.', portrait: 'narrator' }
  ],
  chap1_meet_friends: [
    { speaker: 'Friend 1', text: 'RK! Hey, wait up for us!', portrait: 'friend1' },
    { speaker: 'Friend 2', text: 'You are always walking so fast, yet you stay completely silent.', portrait: 'friend2' },
    { speaker: 'RK', text: 'I am fine... Just enjoying the quiet morning.', portrait: 'rk' },
    { speaker: 'Friend 1', text: 'Same old RK. Come on, we have class before the assembly bell rings!', portrait: 'friend1' },
    { speaker: 'MPC', text: 'RK rarely spoke unless spoken to. For him, silence was not loneliness—it was peace.', portrait: 'narrator' }
  ],

  // --- CHAPTER 2: THE GIRL ---
  chap2_notice_girl: [
    { speaker: 'MPC', text: 'In the school courtyard under the morning sun, someone walks past.', portrait: 'narrator' },
    { speaker: 'RK', text: '(Why... why is my heart suddenly beating so fast?)', portrait: 'rk' },
    { speaker: 'MPC', text: 'She glances over. For a fleeting second, their eyes meet across the petal-scattered courtyard.', portrait: 'narrator' }
  ],
  chap2_choice: {
    prompt: 'How does RK react in this brief moment?',
    choices: [
      { text: 'Look directly at her', effect: { loveMemory: 2, noticedFirstLove: true }, next: 'chap2_look_at_her' },
      { text: 'Look away nervously', effect: { loveMemory: 1, noticedFirstLove: true }, next: 'chap2_look_away' },
      { text: 'Turn and talk to his friends', effect: { friendship: 1, noticedFirstLove: true }, next: 'chap2_talk_friend' }
    ]
  },
  chap2_look_at_her: [
    { speaker: 'RK', text: '(Her eyes are gentle... but my face feels burning warm.)', portrait: 'rk' },
    { speaker: 'First Love Girl', text: '...', portrait: 'firstlove' },
    { speaker: 'MPC', text: 'She gives a tiny, shy smile before walking toward the corridor. The memory etches deeply into RK\'s mind.', portrait: 'narrator' }
  ],
  chap2_look_away: [
    { speaker: 'RK', text: '(I quickly look down at my shoes, my hands tightening around my backpack straps.)', portrait: 'rk' },
    { speaker: 'MPC', text: 'He looked away out of nervousness, his heart echoing like distant thunder.', portrait: 'narrator' }
  ],
  chap2_talk_friend: [
    { speaker: 'RK', text: 'Hey... did you guys finish the homework from yesterday?', portrait: 'rk' },
    { speaker: 'Friend 1', text: 'Haha! You know me, finished it during breakfast!', portrait: 'friend1' },
    { speaker: 'MPC', text: 'RK hid his racing pulse behind casual words with his friends.', portrait: 'narrator' }
  ],

  // --- CHAPTER 3: RECORD NOTE ---
  chap3_intro: [
    { speaker: 'MPC', text: 'Chapter 3: The Record Notebook. In the quiet afternoon classroom, practical records are due for submission.', portrait: 'narrator' },
    { speaker: 'RK', text: '(I need the lab record signed by the instructor... but she is standing right at the front desk.)', portrait: 'rk' }
  ],
  chap3_approach: [
    { speaker: 'MPC', text: 'RK walks toward the front. The girl turns around, holding her hardcover notebook.', portrait: 'narrator' },
    { speaker: 'First Love Girl', text: 'Are you here for the submission too?', portrait: 'firstlove' },
    { speaker: 'RK', text: 'Y-yes... here.', portrait: 'rk' },
    { speaker: 'MPC', text: 'As RK reaches out his hand to pass the record book, his fingers tremble slightly.', portrait: 'narrator' },
    { speaker: 'First Love Girl', text: 'Thank you. You write very neatly, RK.', portrait: 'firstlove' },
    { speaker: 'RK', text: '(A small, almost invisible smile appears on his face. He nods quietly, not trusting his voice.)', portrait: 'rk' }
  ],

  // --- CHAPTER 4: THE SECRET ---
  chap4_intro: [
    { speaker: 'Friend 1', text: 'RK, can I tell you something? Promise you won\'t laugh.', portrait: 'friend1' },
    { speaker: 'RK', text: 'What is it?', portrait: 'rk' },
    { speaker: 'Friend 1', text: 'I think... I really like that girl from our class.', portrait: 'friend1' },
    { speaker: 'RK', text: '...', portrait: 'rk' },
    { speaker: 'Friend 1', text: 'I want to tell her after the semester exams. What do you think?', portrait: 'friend1' },
    { speaker: 'MPC', text: 'Inside RK\'s chest, a sudden quiet ache settled in. He held feelings for her too, but his friend\'s happiness mattered more.', portrait: 'narrator' },
    { speaker: 'RK', text: 'If you really like her... you should be honest with her.', portrait: 'rk' },
    { speaker: 'MPC', text: 'RK decided in that moment of silence to bury his own unspoken feelings.', portrait: 'narrator' }
  ],

  // --- CHAPTER 5: LETTING GO ---
  chap5_intro: [
    { speaker: 'MPC', text: 'Chapter 5: Letting Go. Weeks later, the semester drew to a close.', portrait: 'narrator' },
    { speaker: 'Friend 1', text: 'She told me she only sees me as a good friend... It hurts, but it\'s okay.', portrait: 'friend1' },
    { speaker: 'RK', text: '(She didn\'t love him... and yet, I still couldn\'t bring myself to confess.)', portrait: 'rk' },
    { speaker: 'MPC', text: 'Under the fiery orange and violet sunset sky, RK stood on the hill overlooking his hometown.', portrait: 'narrator' },
    { speaker: 'RK', text: '(Some feelings are meant to stay unspoken... beautiful, unfinished memories.)', portrait: 'rk' },
    { speaker: 'MPC', text: 'With the passing breeze, RK let go of his first love. Time moved forward.', portrait: 'narrator' }
  ],

  // --- CHAPTER 6: COLLEGE (7:30 AM TRAIN) ---
  chap6_intro: [
    { speaker: 'MPC', text: 'Chapter 6: College. Time passed. RK is now 21 years old, in his final semester and final month of college.', portrait: 'narrator' },
    { speaker: 'MPC', text: 'Every morning at approximately 7:30 AM, RK boards the local train.', portrait: 'narrator' },
    { speaker: 'RK', text: '(The gentle rumble of the train tracks, the cool morning rain tapping on the window glass...)', portrait: 'rk' },
    { speaker: 'MPC', text: 'Rain, music, and quiet train journeys had become RK\'s safest sanctuary.', portrait: 'narrator' }
  ],
  chap6_window_seat: [
    { speaker: 'RK', text: '(I put on my earphones. Watching the green trees and water droplets slide across the window glass brings complete calm.)', portrait: 'rk' },
    { speaker: 'MPC', text: 'In the midst of an uncertain future, RK found comfort in ordinary, solitary moments.', portrait: 'narrator' }
  ],

  // --- CHAPTER 7: INFINITY KINGDOM ---
  chap7_intro: [
    { speaker: 'MPC', text: 'Chapter 7: Infinity Kingdom. Back home at night, RK logs into an online mobile fantasy game.', portrait: 'narrator' },
    { speaker: 'MPC', text: 'A player nearby sends a friendly wave.', portrait: 'narrator' }
  ],
  chap7_chat: [
    { speaker: 'Charlotte', text: 'Hello! Are you doing the night quest too?', portrait: 'charlotte' },
    { speaker: 'RK', text: 'Hello... Yes, just exploring the area.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Nice to meet you! I\'m Charlotte, playing from the Philippines. Where are you from?', portrait: 'charlotte' },
    { speaker: 'RK', text: 'I am RK, from India.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Nice to meet you, RK! Your avatar looks very peaceful.', portrait: 'charlotte' },
    { speaker: 'MPC', text: 'And so, across thousands of miles of ocean, an unexpected friendship quietly took root.', portrait: 'narrator' }
  ],

  // --- CHAPTER 8: ONLINE FRIENDSHIP ---
  chap8_intro: [
    { speaker: 'MPC', text: 'Chapter 8: Online Friendship. Days turned into weeks. Game chats turned into daily messages.', portrait: 'narrator' }
  ],
  chap8_dialogue: [
    { speaker: 'Charlotte', text: 'Good morning RK! It is 9:00 AM here in Manila already.', portrait: 'charlotte' },
    { speaker: 'RK', text: 'Good morning. It is 6:30 AM here. I am getting ready for train.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Haha, don\'t miss your train! Here, I used translator to send you good wishes:', portrait: 'charlotte' },
    { speaker: 'Charlotte', text: '"May your travel path be strictly untangled and peaceful."', portrait: 'charlotte' },
    { speaker: 'RK', text: 'Strictly untangled? Haha... what does that mean?', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Oh no! The translator made it sound so serious! 😂 I meant have a smooth ride!', portrait: 'charlotte' },
    { speaker: 'RK', text: '(Talking to Charlotte always makes me smile. She feels so genuine and warm.)', portrait: 'rk' },
    { speaker: 'MPC', text: 'Despite language barriers and time zones, their emotional connection grew naturally.', portrait: 'narrator' }
  ],

  // --- CHAPTER 9: PHOTO EXCHANGE ---
  chap9_intro: [
    { speaker: 'MPC', text: 'Chapter 9: Photo Exchange. One quiet evening, Charlotte asks for a photo.', portrait: 'narrator' },
    { speaker: 'Charlotte', text: 'RK, we\'ve been talking for so long, but I don\'t even know what you look like in real life! Can you send a photo?', portrait: 'charlotte' }
  ],
  chap9_choice: {
    prompt: 'How will RK respond to Charlotte\'s request?',
    choices: [
      { text: 'Send a candid photo from the train station', effect: { charlotteConnection: 3, photoExchange: true }, next: 'chap9_send_photo' },
      { text: 'Shyly hesitate before sending', effect: { charlotteConnection: 2, photoExchange: true }, next: 'chap9_shy_send' }
    ]
  },
  chap9_send_photo: [
    { speaker: 'RK', text: 'Here... I took this near the station yesterday.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Aww, you look really kind and thoughtful! You have warm eyes.', portrait: 'charlotte' },
    { speaker: 'RK', text: '(My face feels warm again... but this time, it is pure comfort.)', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Now it\'s my turn! Here is a photo of me with my camera during the sunset in Manila.', portrait: 'charlotte' },
    { speaker: 'RK', text: 'You look wonderful, Charlotte. The sunset in your city is beautiful.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Thank you RK. Sunsets are my favorite thing in the world.', portrait: 'charlotte' }
  ],
  chap9_shy_send: [
    { speaker: 'RK', text: 'I am not very photogenic... but okay, here is one.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Don\'t say that! You look so peaceful and gentle.', portrait: 'charlotte' },
    { speaker: 'Charlotte', text: 'Here is a photo of me too! 😊', portrait: 'charlotte' },
    { speaker: 'RK', text: 'Thank you for sharing, Charlotte. You look so happy.', portrait: 'rk' }
  ],

  // --- CHAPTER 10: FESTIVAL ---
  chap10_intro: [
    { speaker: 'MPC', text: 'Chapter 10: Festival. Tonight is RK\'s hometown festival. Warm lights, fireworks, and laughter fill the night.', portrait: 'narrator' }
  ],
  chap10_terrace: [
    { speaker: 'RK', text: '(I climbed up to my terrace to watch the fireworks away from the crowd.)', portrait: 'rk' },
    { speaker: 'MPC', text: 'Across the ocean, Charlotte stayed awake past 1:00 AM Manila time just to text RK.', portrait: 'narrator' },
    { speaker: 'Charlotte', text: 'RK! Are the festival fireworks starting?', portrait: 'charlotte' },
    { speaker: 'RK', text: 'Yes! Let me take a photo for you right now.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'It looks so magical! I wish I could see it in person with you.', portrait: 'charlotte' },
    { speaker: 'RK', text: 'You can see it through my eyes.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'That is the sweetest thing anyone has ever said to me, RK. Thank you.', portrait: 'charlotte' },
    { speaker: 'MPC', text: 'Two souls separated by thousands of miles, yet connected under the exact same night sky.', portrait: 'narrator' }
  ],

  // --- CHAPTER 11: RED FLAG ---
  chap11_intro: [
    { speaker: 'MPC', text: 'Chapter 11: Red Flag. Late night. A lighthearted, playful conversation begins.', portrait: 'narrator' }
  ],
  chap11_dialogue: [
    { speaker: 'Charlotte', text: 'You know what, RK? Because you never get angry and always listen so patiently...', portrait: 'charlotte' },
    { speaker: 'Charlotte', text: 'You\'re totally a red flag! 😂', portrait: 'charlotte' },
    { speaker: 'RK', text: 'Red flag? What does red flag mean? Is it dangerous?', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Haha! No, silly! It means you\'re too good to be true. I\'m just teasing you.', portrait: 'charlotte' },
    { speaker: 'RK', text: 'Oh... haha. It is getting very late. You should sleep, Charlotte.', portrait: 'rk' },
    { speaker: 'RK', text: 'Goodnight.', portrait: 'rk' },
    { speaker: 'Charlotte', text: 'Goodnight, my favorite red flag. Talk to you tomorrow! 🌸', portrait: 'charlotte' },
    { speaker: 'RK', text: '(I smile, put my phone on the table, and close my eyes in peace.)', portrait: 'rk' },
    { speaker: 'MPC', text: 'Neither of them realized that this would become their final chat.', portrait: 'narrator' }
  ],

  // --- ENDING: THE FINAL SUNSET ---
  ending_sequence: [
    { speaker: 'MPC', text: 'The screens grew dark.', portrait: 'narrator' },
    { speaker: 'MPC', text: 'In India, RK slept peacefully dreaming of the next morning\'s train.', portrait: 'narrator' },
    { speaker: 'MPC', text: 'In the Philippines, the dawn broke over Manila with a quiet golden warmth.', portrait: 'narrator' },
    { speaker: 'MPC', text: 'Sometimes the people who become important to us enter our lives through ordinary moments...', portrait: 'narrator' },
    { speaker: 'MPC', text: '...and we don\'t realize the last moment is the last until it is already gone.', portrait: 'narrator' }
  ]
};

window.STORY_DATA = STORY_DATA;
