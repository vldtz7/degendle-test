// ============================================================================
// POST /api/guess - Validates a guess server-side
// Compatible with Next.js 16.1+
// ============================================================================

// Same puzzle database - keep in sync with /api/puzzle/route.js
// In production, move this to a shared module or database
const puzzles = [
  { hint: "bro keeps saying 4", answer: "cz", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/1961440580279336960/PiiIs8Lh_400x400.jpg" },
  { hint: "bro was upset at WOW and made a whole ass blockchain", answer: ["vitalik buterin", "vitalik"], category: "Personality", imageHint: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg" },
  { hint: "bro wants to buy all the bitcoin", answer: "michael saylor", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/1485632175932383235/8t0DGo6V_400x400.jpg" },
  { hint: "bro made the app where all these people are in my DMs trying to scam me", answer: "pavel durov", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/658376777258151936/-Jz8l4Rr_400x400.jpg" },
  { hint: "bro will find out if you scam", answer: "zachxbt", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/2006489492593455104/7--yA6Jz_400x400.jpg" },
  { hint: "bro has a very high iq and prefers solana", answer: ["sbb", "solbigbrain"], category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/1873772860566638592/cTfnGR67_400x400.jpg" },
  { hint: "bro made a CEX and also bald", answer: "brian armstrong", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/1516832438818770944/n77EwnKU_400x400.png" },
  { hint: "bro linked some chains or something", answer: "sergey nazarov", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/751118197126991873/eSXubsCD_400x400.jpg" },
  { hint: "bro made a chain and also likes daylight", answer: "justin sun", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/1954484454942298112/gmiMeJRS_400x400.jpg" },
  { hint: "bro took a rock and made it black", answer: "larry fink", category: "Personality", imageHint: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Larry_Fink_with_Valdis_Dombrovskis_%28cropped%29.jpg/960px-Larry_Fink_with_Valdis_Dombrovskis_%28cropped%29.jpg" },
  { hint: "bro made a chain and changed its name a few times and likes purple", answer: "sandeep nailwal", category: "Personality", imageHint: "https://www.tbstat.com/wp/uploads/2025/04/Sandeep-Nailwal.jpg" },
  { hint: "bro walked so we could run", answer: ["satoshi nakamoto", "satoshi"], category: "Personality", imageHint: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Bust_of_Satoshi_Nakamoto_in_Budapest.jpg/960px-Bust_of_Satoshi_Nakamoto_in_Budapest.jpg" },
  { hint: "bro made a chain with like 4 tx/s that nobody uses", answer: "charles hoskinson", category: "Personality", imageHint: "https://upload.wikimedia.org/wikipedia/commons/d/db/Charles-Falcon2.jpg" },
  { hint: "bro made a site for memes and then decided he also likes crypto", answer: "ray chan", category: "Personality", imageHint: "https://img-9gag-fun.9cache.com/photo/aQ95z7e_460s.jpg" },
  { hint: "bro is bald and won't shut up about privacy", answer: "mert", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/1975912876243095552/YlVLO4Oz_400x400.jpg" },
  { hint: "they keep saying that we are all gonna be okay", answer: "okay bears", category: "NFT Project", imageHint: "https://pbs.twimg.com/profile_images/1947609830409297920/-MryzKE1_400x400.jpg" },
  { hint: "bro literally has a hat", answer: ["dogwifhat", "wif"], category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1723823186473529344/nms-iIKi_400x400.jpg" },
  { hint: "sis literally pops", answer: "popcat", category: "Memecoin", imageHint: "https://i.pinimg.com/originals/64/4b/88/644b88254ec38a97c422ce861ddcaea2.gif" },
  { hint: "HOT AIR RISES", answer: "fartcoin", category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg" },
  { hint: "sis literally is a hippo", answer: ["moodeng", "moo deng"], category: "Memecoin", imageHint: "https://pbs.twimg.com/media/G950e2qaEAAye-l?format=png&name=small" },
  { hint: "bro was literally a squirrel and the NY state department didn't like that", answer: "pnut", category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1870183393469636608/L3V7eawZ_400x400.jpg" },
  { hint: "they won't shut up about being the first NFT and how rebellious they are", answer: ["cryptopunks", "crypto punks"], category: "NFT Project", imageHint: "https://pbs.twimg.com/profile_images/1922291037399130112/_zX240jO_400x400.jpg" },
  { hint: "they won't shut up about how bored they are on some boat", answer: ["bored ape yacht club", "bayc"], category: "NFT Project", imageHint: "https://pbs.twimg.com/profile_images/1608904721489592321/o7Sj4Iln_400x400.jpg" },
  { hint: "bro likes dropshipping and penguins", answer: "luca netz", category: "Personality", imageHint: "https://pbs.twimg.com/profile_images/1849498278255071232/drdvg74U_400x400.jpg" },
  { hint: "they are literally penguins that you can find in your local target", answer: "pudgy penguins", category: "NFT Project", imageHint: "https://pbs.twimg.com/profile_images/1848765927451492364/VysuN6mu_400x400.jpg" },
  { hint: "these are really nice colored lines on the expensive chain", answer: "fidenza", category: "NFT Project", imageHint: "https://cdn.sanity.io/images/6e7gp05s/production/043c8425307fc7c6dda195012b3a42868f900bee-1734x2080.png" },
  { hint: "they are literally birds that flew into the cosmos. they keep saying birb.", answer: "moonbirds", category: "NFT Project", imageHint: "https://pbs.twimg.com/profile_images/1966155763883106304/eUbIV6Cm_400x400.jpg" },
  { hint: "they are always angry about something and all of them wear backpacks", answer: "mad lads", category: "NFT Project", imageHint: "https://pbs.twimg.com/media/Fn5qPSZX0AEZA-y?format=jpg&name=4096x4096" },
  { hint: "they all look to the left and are really into anime and...beans?", answer: "azuki", category: "NFT Project", imageHint: "https://nftevening.com/wp-content/uploads/2022/05/Azuki-NFT-Founder.png" },
  { hint: "they are very colorful cartoons that Pharrell really likes", answer: "doodles", category: "NFT Project", imageHint: "https://pbs.twimg.com/profile_images/1999705009307480065/pYyZa73W_400x400.jpg" },
  { hint: "they are literally dinosaurs made of earth", answer: "claynosaurz", category: "NFT Project", imageHint: "https://pbs.twimg.com/media/G9WuiGDaYAQ7rjs?format=jpg&name=large" },
  { hint: "they keep yelling reject humanity and to return to something", answer: ["solana monkey business", "smb"], category: "NFT Project", imageHint: "https://pbs.twimg.com/profile_images/1710292365359869953/ryZ9MB2t_400x400.jpg" },
  { hint: "they chainhopped like no other", answer: "degods", category: "NFT Project", imageHint: "https://pbs.twimg.com/media/GG-NhDfXcAA52M5?format=png&name=4096x4096" },
  { hint: "from my understanding they have a curse and like 584204 derivatives", answer: "milady", category: "NFT Project", imageHint: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fi2c.seadn.io%2Fcollection%2Fmilady%2Fimage%2Fd4499e2e55f5e85ead4b0eb7f7dad7%2F90d4499e2e55f5e85ead4b0eb7f7dad7.jpeg" },
  { hint: "bro literally is the original memecoin", answer: ["dogecoin", "doge"], category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/378800000857919980/lHqPIZza_400x400.png" },
  { hint: "bro is literally just a green frog from a sus forum", answer: "pepe", category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1773538965674688512/dVZdh1SM_400x400.jpg" },
  { hint: "the type of shit you hear when you get hit in the head with a bat", answer: "bonk", category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1600956334635098141/ZSzYTrHf_400x400.jpg" },
  { hint: "take the S&P but make it cool or something", answer: ["spx6900", "spx"], category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1797870574397452288/6siva-oU_400x400.jpg" },
  { hint: "bro is literally a very big pale fish", answer: ["the white whale", "whitewhale"], category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1966542384956641280/p3W-NDXk_400x400.jpg" },
  { hint: "finger pointing at you emoji; cat with shades crying laughing emoji", answer: "mog", category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1706379006063288321/rwnCvTH2_400x400.jpg" },
  { hint: "this literally doesn't do anything at all", answer: "useless", category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1951697460402835456/Qapb7zRc_400x400.jpg" },
  { hint: "it's literally just a book of funny pictures?", answer: ["book of meme", "bome"], category: "Memecoin", imageHint: "https://cdn.dexscreener.com/cms/images/1fdb1c93b76e5aed7324c2c541558fd75fe7ffb3d0d0fb9ee8370cbac5890e4e?width=800&height=800&fit=crop&quality=95&format=auto" },
  { hint: "Harry potter obama and sonic walk into a bar and order 10 dogs", answer: ["harrypotterobamasonic10inu", "hpos10i", "bitcoin"], category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1879750517896728576/JFKUSLtp_400x400.jpg" },
  { hint: "bro is literally if a gigabyte went to the gym instead of memory", answer: ["gigachad", "giga"], category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1747652306521255936/LlxV2aBK_400x400.jpg" },
  { hint: "bro is literally a cyber sheep or something", answer: ["goatseus maximus", "goat"], category: "Memecoin", imageHint: "https://cdn.dexscreener.com/cms/images/e857505d98436d21d13451a83c93ff4db36d0b53829af8070ddae75845d9b459?width=800&height=800&fit=crop&quality=95&format=auto" },
  { hint: "bro is the LLM cousin of zachXBT", answer: "aixbt", category: "Memecoin", imageHint: "https://pbs.twimg.com/profile_images/1874758416658509824/UPaVddbm_400x400.jpg" },
  { hint: "is like zebrabro or some shit like that", answer: "zerebro", category: "Memecoin", imageHint: "https://cdn.dexscreener.com/cms/images/2eb3b0a304e9ed93ee44ff263a7cd1c5b376589644b70618aef104a037f391c2?width=800&height=800&fit=crop&quality=95&format=auto" },
  { hint: "only thing bro wanted to do was literally chill", answer: ["just a chill guy", "chillguy"], category: "Memecoin", imageHint: "https://cdn.dexscreener.com/cms/images/20ae19e21d577f3aead6ae8722a7a3a66c5376cbf11f10d278807bef32551b46?width=800&height=800&fit=crop&quality=95&format=auto" },
];

// Rate limiting map (in production, use Redis or Vercel KV)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function getDayNumber() {
  const today = new Date();
  const startDate = new Date('2024-01-01');
  return Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
}

function getTodaysPuzzle() {
  const dayNumber = getDayNumber();
  const puzzleIndex = (dayNumber - 1) % puzzles.length;
  return { ...puzzles[puzzleIndex], dayNumber };
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { timestamp: now, count: 1 });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(request) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    const { guess, guessNumber, testIndex } = body;
    
    // Validate input
    if (!guess || typeof guess !== 'string') {
      return Response.json(
        { error: 'Invalid guess' },
        { status: 400 }
      );
    }
    
    if (typeof guessNumber !== 'number' || guessNumber < 1 || guessNumber > 5) {
      return Response.json(
        { error: 'Invalid guess number' },
        { status: 400 }
      );
    }
    
    // Get puzzle (test mode or normal mode)
    let puzzle;
    if (testIndex !== null && testIndex !== undefined && testIndex !== '') {
      const index = parseInt(testIndex, 10) % puzzles.length;
      puzzle = { ...puzzles[index], dayNumber: index + 1 };
    } else {
      puzzle = getTodaysPuzzle();
    }
    
    const guessLower = guess.toLowerCase().trim();
    
    // Check if answer matches (supports single string or array of valid answers)
    let isCorrect = false;
    let displayAnswer = puzzle.answer;
    
    if (Array.isArray(puzzle.answer)) {
      isCorrect = puzzle.answer.some(ans => guessLower === ans.toLowerCase().trim());
      displayAnswer = puzzle.answer[0]; // Show first answer as the "official" one
    } else {
      isCorrect = guessLower === puzzle.answer.toLowerCase().trim();
    }
    
    const isLastGuess = guessNumber >= 5;
    const gameOver = isCorrect || isLastGuess;
    
    // Build response
    const response = {
      correct: isCorrect,
      guessNumber,
      gameOver,
    };
    
    // Include image hint after 3 wrong guesses OR on correct answer (to show with stars)
    if ((guessNumber >= 3 && !isCorrect) || isCorrect) {
      response.imageHint = puzzle.imageHint;
    }
    
    // Only reveal answer if game is over
    if (gameOver) {
      response.answer = displayAnswer;
    }
    
    return Response.json(response);
    
  } catch (error) {
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
