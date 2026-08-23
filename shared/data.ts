export interface Option { id: string; label: string; tag: string }

const o = (id: string, label: string, tag = label.toLowerCase()): Option => ({ id, label, tag })

export interface OptionGroup { id: string; label: string; options: Option[] }
export interface GenreGroup { id: string; label: string; genres: Option[] }

export const GENRE_GROUPS: GenreGroup[] = [
  { id: 'house', label: 'House', genres: [
    o('house', 'House'), o('deephouse', 'Deep House'), o('techhouse', 'Tech House'), o('proghouse', 'Progressive House'),
    o('futurehouse', 'Future House'), o('tropical', 'Tropical House'), o('frenchhouse', 'French House'), o('discohouse', 'Disco House'),
    o('afrohouse', 'Afro House'), o('melodichouse', 'Melodic House'), o('organichouse', 'Organic House'), o('bassh', 'Bass House'),
    o('acidhouse', 'Acid House'), o('chicago', 'Chicago House'), o('lofihouse', 'Lo-fi House'), o('electrohouse', 'Electro House'),
  ]},
  { id: 'techno', label: 'Techno', genres: [
    o('techno', 'Techno'), o('melodictechno', 'Melodic Techno'), o('minimal', 'Minimal Techno'), o('detroit', 'Detroit Techno'),
    o('hardtechno', 'Hard Techno'), o('industrialtechno', 'Industrial Techno'), o('dubtechno', 'Dub Techno'), o('acidtechno', 'Acid Techno'),
    o('peaktime', 'Peak Time Techno'), o('hypnotic', 'Hypnotic Techno'), o('schranz', 'Schranz'),
  ]},
  { id: 'trance', label: 'Trance', genres: [
    o('trance', 'Trance'), o('progtrance', 'Progressive Trance'), o('uplifting', 'Uplifting Trance'), o('goa', 'Goa Trance'),
    o('psytrance', 'Psytrance'), o('fullon', 'Full-On Psytrance'), o('darkpsy', 'Dark Psytrance'), o('forest', 'Forest Psy'),
    o('hitech', 'Hi-Tech Psy'), o('vocaltrance', 'Vocal Trance'), o('techtrance', 'Tech Trance'), o('hardtrance', 'Hard Trance'),
    o('classictrance', '90s Classic Trance'), o('psychill', 'Psychill'),
  ]},
  { id: 'bass', label: 'Bass & Breaks', genres: [
    o('dnb', 'Drum & Bass', 'drum and bass'), o('liquid', 'Liquid DnB', 'liquid drum and bass'), o('neurofunk', 'Neurofunk'), o('jungle', 'Jungle'),
    o('jumpup', 'Jump-Up DnB'), o('dubstep', 'Dubstep'), o('riddim', 'Riddim'), o('melodicdubstep', 'Melodic Dubstep'), o('brostep', 'Brostep'),
    o('garage', 'UK Garage'), o('2step', '2-Step'), o('speedgarage', 'Speed Garage'), o('grime', 'Grime'), o('breakbeat', 'Breakbeat'),
    o('bigbeat', 'Big Beat'), o('drumstep', 'Drumstep'), o('halftime', 'Halftime'), o('trapedm', 'Festival Trap'), o('footwork', 'Footwork'),
    o('ukbass', 'UK Bass'), o('breakcore', 'Breakcore'), o('dub', 'Dub'),
  ]},
  { id: 'hard', label: 'Hard Dance', genres: [
    o('hardstyle', 'Hardstyle'), o('rawstyle', 'Rawstyle'), o('hardcore', 'Hardcore'), o('gabber', 'Gabber'), o('happyhardcore', 'Happy Hardcore'),
    o('uptempo', 'Uptempo Hardcore'), o('frenchcore', 'Frenchcore'), o('jumpstyle', 'Jumpstyle'), o('hands', 'Hands Up'), o('bigroom', 'Big Room'),
    o('eurodance', 'Eurodance'), o('donk', 'Bounce / Donk'),
  ]},
  { id: 'electronic', label: 'Electronic & Synth', genres: [
    o('edm', 'EDM'), o('electro', 'Electro'), o('synthwave', 'Synthwave'), o('retrowave', 'Retrowave'), o('darksynth', 'Darksynth'),
    o('outrun', 'Outrun'), o('vaporwave', 'Vaporwave'), o('chillwave', 'Chillwave'), o('synthpop', 'Synthpop'), o('electropop', 'Electropop'),
    o('futurebass', 'Future Bass'), o('idm', 'IDM'), o('glitch', 'Glitch'), o('glitchhop', 'Glitch Hop'), o('electronica', 'Electronica'),
    o('downtempo', 'Downtempo'), o('triphop', 'Trip Hop'), o('nudisco', 'Nu-Disco'), o('italo', 'Italo Disco'), o('chiptune', 'Chiptune'),
    o('hyperpop', 'Hyperpop'), o('ebm', 'EBM'), o('industrial', 'Industrial'), o('witchhouse', 'Witch House'), o('phonk', 'Phonk'),
    o('driftphonk', 'Drift Phonk'), o('jerseyclub', 'Jersey Club'), o('moombahton', 'Moombahton'), o('complextro', 'Complextro'),
  ]},
  { id: 'hiphop', label: 'Hip Hop & R&B', genres: [
    o('hiphop', 'Hip Hop'), o('boombap', 'Boom Bap'), o('trap', 'Trap'), o('drill', 'Drill'), o('ukdrill', 'UK Drill'), o('lofi', 'Lo-fi Hip Hop', 'lo-fi hip hop'),
    o('cloudrap', 'Cloud Rap'), o('conscious', 'Conscious Rap'), o('gfunk', 'G-Funk'), o('crunk', 'Crunk'), o('memphis', 'Memphis Rap'),
    o('rage', 'Rage'), o('plugg', 'Plugg'), o('jazzrap', 'Jazz Rap'), o('rnb', 'R&B', 'r&b'), o('altrnb', 'Alternative R&B', 'alternative r&b'),
    o('neosoul', 'Neo-Soul'), o('newjack', 'New Jack Swing'), o('afroswing', 'Afroswing'),
  ]},
  { id: 'pop', label: 'Pop', genres: [
    o('pop', 'Pop'), o('danceop', 'Dance Pop'), o('indiepop', 'Indie Pop'), o('dreampop', 'Dream Pop'), o('bedroompop', 'Bedroom Pop'),
    o('artpop', 'Art Pop'), o('powerpop', 'Power Pop'), o('bubblegum', 'Bubblegum Pop'), o('kpop', 'K-Pop', 'k-pop'), o('jpop', 'J-Pop', 'j-pop'),
    o('citypop', 'City Pop'), o('latinpop', 'Latin Pop'), o('europop', 'Europop'), o('teenpop', 'Teen Pop'), o('sophistipop', 'Sophisti-Pop'),
    o('chamberpop', 'Chamber Pop'), o('yacht', 'Yacht Rock'), o('schlager', 'Schlager'),
  ]},
  { id: 'rock', label: 'Rock', genres: [
    o('rock', 'Rock'), o('classicrock', 'Classic Rock'), o('indie', 'Indie Rock'), o('altrock', 'Alternative Rock'), o('garage_rock', 'Garage Rock'),
    o('psychrock', 'Psychedelic Rock'), o('progrock', 'Progressive Rock'), o('postrock', 'Post-Rock'), o('shoegaze', 'Shoegaze'), o('grunge', 'Grunge'),
    o('punk', 'Punk'), o('poppunk', 'Pop Punk'), o('postpunk', 'Post-Punk'), o('hardrock', 'Hard Rock'), o('southernrock', 'Southern Rock'),
    o('surfrock', 'Surf Rock'), o('mathrock', 'Math Rock'), o('emo', 'Emo'), o('britpop', 'Britpop'), o('stoner', 'Stoner Rock'),
    o('bluesrock', 'Blues Rock'), o('folkrock', 'Folk Rock'), o('newwave', 'New Wave'), o('gothrock', 'Gothic Rock'),
  ]},
  { id: 'metal', label: 'Metal', genres: [
    o('metal', 'Metal'), o('heavymetal', 'Heavy Metal'), o('thrash', 'Thrash Metal'), o('death', 'Death Metal'), o('black', 'Black Metal'),
    o('doom', 'Doom Metal'), o('sludge', 'Sludge'), o('metalcore', 'Metalcore'), o('deathcore', 'Deathcore'), o('djent', 'Djent'),
    o('progmetal', 'Progressive Metal'), o('powermetal', 'Power Metal'), o('symphonicmetal', 'Symphonic Metal'), o('numetal', 'Nu Metal'),
    o('folkmetal', 'Folk Metal'), o('industrialmetal', 'Industrial Metal'), o('postmetal', 'Post-Metal'), o('glam', 'Glam Metal'),
  ]},
  { id: 'jazz', label: 'Jazz, Blues & Soul', genres: [
    o('jazz', 'Jazz'), o('bebop', 'Bebop'), o('cooljazz', 'Cool Jazz'), o('swing', 'Swing'), o('bigband', 'Big Band'), o('jazzfusion', 'Jazz Fusion'),
    o('smoothjazz', 'Smooth Jazz'), o('nujazz', 'Nu Jazz'), o('acidjazz', 'Acid Jazz'), o('freejazz', 'Free Jazz'), o('latinjazz', 'Latin Jazz'),
    o('blues', 'Blues'), o('deltablues', 'Delta Blues'), o('chicagoblues', 'Chicago Blues'), o('soul', 'Soul'), o('motown', 'Motown'),
    o('funk', 'Funk'), o('pfunk', 'P-Funk'), o('disco', 'Disco'), o('gospel', 'Gospel'), o('lounge', 'Lounge'),
  ]},
  { id: 'folk', label: 'Folk, Country & Americana', genres: [
    o('folk', 'Folk'), o('indiefolk', 'Indie Folk'), o('folkpop', 'Folk Pop'), o('singersongwriter', 'Singer-Songwriter'), o('country', 'Country'),
    o('altcountry', 'Alt-Country'), o('outlaw', 'Outlaw Country'), o('bluegrass', 'Bluegrass'), o('americana', 'Americana'), o('celtic', 'Celtic Folk'),
    o('seashanty', 'Sea Shanty'), o('acousticpop', 'Acoustic Pop'), o('nordicfolk', 'Nordic Folk'), o('medieval', 'Medieval Folk'),
  ]},
  { id: 'world', label: 'World & Latin', genres: [
    o('reggae', 'Reggae'), o('dancehall', 'Dancehall'), o('ska', 'Ska'), o('reggaeton', 'Reggaeton'), o('latin', 'Latin'), o('salsa', 'Salsa'),
    o('bachata', 'Bachata'), o('cumbia', 'Cumbia'), o('bossa', 'Bossa Nova'), o('samba', 'Samba'), o('tango', 'Tango'), o('flamenco', 'Flamenco'),
    o('afrobeat', 'Afrobeat'), o('afrobeats', 'Afrobeats'), o('amapiano', 'Amapiano'), o('highlife', 'Highlife'), o('soca', 'Soca'),
    o('bollywood', 'Bollywood'), o('bhangra', 'Bhangra'), o('kizomba', 'Kizomba'), o('baile', 'Baile Funk'), o('mariachi', 'Mariachi'),
    o('klezmer', 'Klezmer'), o('balkan', 'Balkan Brass'), o('arabic', 'Arabic Pop'), o('turkish', 'Turkish Psych'),
  ]},
  { id: 'ambient', label: 'Ambient, Cinematic & Classical', genres: [
    o('ambient', 'Ambient'), o('darkambient', 'Dark Ambient'), o('drone', 'Drone'), o('newage', 'New Age'), o('cinematic', 'Cinematic'),
    o('epictrailer', 'Epic Trailer'), o('filmscore', 'Film Score'), o('orchestral', 'Orchestral'), o('classical', 'Classical'), o('baroque', 'Baroque'),
    o('romantic', 'Romantic Era'), o('neoclassical', 'Neoclassical'), o('minimalism', 'Minimalism'), o('modernclassical', 'Modern Classical'),
    o('chamber', 'Chamber Music'), o('solopiano', 'Solo Piano'), o('choral', 'Choral'), o('videogame', 'Video Game Score'), o('spacemusic', 'Space Music'),
  ]},
  { id: 'experimental', label: 'Experimental & Other', genres: [
    o('experimental', 'Experimental'), o('noise', 'Noise'), o('avantgarde', 'Avant-Garde'), o('musique', 'Musique Concrète'), o('krautrock', 'Krautrock'),
    o('mathcore', 'Mathcore'), o('slowcore', 'Slowcore'), o('meme', 'Novelty / Comedy'), o('musical', 'Musical Theatre'), o('christmas', 'Christmas'),
    o('kids', "Children's Music"), o('lullaby', 'Lullaby'), o('marching', 'Marching Band'), o('spokenword', 'Spoken Word'), o('asmr', 'ASMR'),
  ]},
]

export const GENRES: Option[] = GENRE_GROUPS.flatMap((g) => g.genres)
export const genreGroupOf = (id: string) => GENRE_GROUPS.find((g) => g.genres.some((x) => x.id === id))?.id

export const INSTRUMENT_GROUPS: OptionGroup[] = [
  { id: 'keys', label: 'Keys', options: [
    o('piano', 'Piano'), o('grandpiano', 'Grand Piano'), o('uprightpiano', 'Upright Piano'), o('rhodes', 'Rhodes'), o('wurlitzer', 'Wurlitzer'),
    o('organ', 'Organ'), o('hammond', 'Hammond Organ'), o('churchorgan', 'Church Organ'), o('harpsichord', 'Harpsichord'), o('celesta', 'Celesta'),
    o('clavinet', 'Clavinet'), o('accordion', 'Accordion'), o('melodica', 'Melodica'), o('toypiano', 'Toy Piano'),
  ]},
  { id: 'guitars', label: 'Guitars & Plucked', options: [
    o('acoustic', 'Acoustic Guitar'), o('nylon', 'Nylon Guitar'), o('twelvestring', '12-String Guitar'), o('electric', 'Electric Guitar'),
    o('cleangtr', 'Clean Electric Guitar'), o('distgtr', 'Distorted Guitar'), o('slide', 'Slide Guitar'), o('pedalsteel', 'Pedal Steel'),
    o('bass', 'Bass Guitar'), o('fretless', 'Fretless Bass'), o('upright', 'Upright Bass'), o('slapbass', 'Slap Bass'),
    o('ukulele', 'Ukulele'), o('banjo', 'Banjo'), o('mandolin', 'Mandolin'), o('harp', 'Harp'), o('sitar', 'Sitar'), o('oud', 'Oud'),
    o('koto', 'Koto'), o('balalaika', 'Balalaika'), o('bouzouki', 'Bouzouki'), o('charango', 'Charango'),
  ]},
  { id: 'synths', label: 'Synths & Electronic', options: [
    o('analog', 'Analog Synths'), o('modular', 'Modular Synth'), o('fm', 'FM Synth'), o('wavetable', 'Wavetable Synth'), o('synthbass', 'Synth Bass'),
    o('reese', 'Reese Bass'), o('acid303', '303 Acid Bass'), o('808', '808s', '808 bass'), o('pads', 'Synth Pads'), o('arp', 'Arpeggiator'),
    o('supersaw', 'Supersaw Lead'), o('plucksynth', 'Pluck Synth'), o('synthbrass', 'Synth Brass'), o('chipsynth', 'Chiptune Synth'),
    o('theremin', 'Theremin'), o('sampler', 'Sampler'), o('granular', 'Granular Textures'), o('vocoderinst', 'Vocoder'), o('talkbox', 'Talkbox'),
  ]},
  { id: 'orchestralstrings', label: 'Orchestral Strings', options: [
    o('strings', 'Strings'), o('violin', 'Violin'), o('viola', 'Viola'), o('cello', 'Cello'), o('doublebass', 'Double Bass'),
    o('stringquartet', 'String Quartet'), o('pizzicato', 'Pizzicato Strings'), o('fiddle', 'Fiddle'), o('erhu', 'Erhu'),
  ]},
  { id: 'brass', label: 'Brass & Winds', options: [
    o('brass', 'Brass'), o('trumpet', 'Trumpet'), o('trombone', 'Trombone'), o('frenchhorn', 'French Horn'), o('tuba', 'Tuba'),
    o('sax', 'Saxophone'), o('altosax', 'Alto Sax'), o('tenorsax', 'Tenor Sax'), o('barisax', 'Baritone Sax'), o('clarinet', 'Clarinet'),
    o('flute', 'Flute'), o('panflute', 'Pan Flute'), o('oboe', 'Oboe'), o('bassoon', 'Bassoon'), o('harmonica', 'Harmonica'),
    o('bagpipes', 'Bagpipes'), o('duduk', 'Duduk'), o('shakuhachi', 'Shakuhachi'), o('didgeridoo', 'Didgeridoo'), o('whistle', 'Tin Whistle'),
  ]},
  { id: 'drums', label: 'Drums & Percussion', options: [
    o('drums', 'Live Drums'), o('drummachine', 'Drum Machine'), o('tr909', 'TR-909 Drums'), o('tr808', 'TR-808 Drums'), o('breakbeats', 'Breakbeat Samples'),
    o('brushes', 'Brushed Drums'), o('perc', 'Percussion'), o('congas', 'Congas'), o('bongos', 'Bongos'), o('djembe', 'Djembe'),
    o('tabla', 'Tabla'), o('cajon', 'Cajón'), o('timpani', 'Timpani'), o('taiko', 'Taiko Drums'), o('steeldrum', 'Steel Drums'),
    o('tambourine', 'Tambourine'), o('shaker', 'Shakers'), o('claps', 'Handclaps'), o('stomps', 'Stomps'), o('cowbell', 'Cowbell'),
    o('marimba', 'Marimba'), o('vibraphone', 'Vibraphone'), o('xylophone', 'Xylophone'), o('glockenspiel', 'Glockenspiel'), o('bells', 'Bells'),
    o('tubularbells', 'Tubular Bells'), o('kalimba', 'Kalimba'), o('handpan', 'Handpan'), o('gong', 'Gong'), o('woodblock', 'Woodblocks'),
  ]},
  { id: 'voicelike', label: 'Voices & Textures', options: [
    o('choir', 'Choir'), o('beatbox', 'Beatbox', 'beatboxing'), o('vocalchops', 'Vocal Chops'), o('whistling', 'Whistling'),
    o('vinyl', 'Vinyl Crackle'), o('tapehiss', 'Tape Hiss'), o('fieldrec', 'Field Recordings'), o('rain', 'Rain Sounds'), o('foley', 'Foley Percussion'),
    o('musicbox', 'Music Box'), o('bagpipe', 'Hurdy-Gurdy'), o('turntable', 'Turntable Scratches'),
  ]},
]
export const INSTRUMENTS: Option[] = INSTRUMENT_GROUPS.flatMap((g) => g.options)

export const MOOD_GROUPS: OptionGroup[] = [
  { id: 'bright', label: 'Bright & Positive', options: [
    o('euphoric', 'Euphoric'), o('uplifting', 'Uplifting'), o('hopeful', 'Hopeful'), o('joyful', 'Joyful'), o('triumphant', 'Triumphant'),
    o('playful', 'Playful'), o('sunny', 'Sunny'), o('carefree', 'Carefree'), o('optimistic', 'Optimistic'), o('celebratory', 'Celebratory'),
    o('festive', 'Festive'), o('cheerful', 'Cheerful'), o('bubbly', 'Bubbly'), o('radiant', 'Radiant'), o('blissful', 'Blissful'),
  ]},
  { id: 'warm', label: 'Warm & Tender', options: [
    o('warm', 'Warm'), o('romantic', 'Romantic'), o('sensual', 'Sensual'), o('tender', 'Tender'), o('intimate', 'Intimate'),
    o('comforting', 'Comforting'), o('cozy', 'Cozy'), o('gentle', 'Gentle'), o('loving', 'Loving'), o('heartfelt', 'Heartfelt'),
    o('nostalgic', 'Nostalgic'), o('bittersweet', 'Bittersweet'), o('wistful', 'Wistful'), o('sentimental', 'Sentimental'),
  ]},
  { id: 'calm', label: 'Calm & Dreamy', options: [
    o('dreamy', 'Dreamy'), o('ethereal', 'Ethereal'), o('peaceful', 'Peaceful'), o('chill', 'Chill'), o('lazy', 'Lazy'),
    o('meditative', 'Meditative'), o('serene', 'Serene'), o('floating', 'Floating'), o('hazy', 'Hazy'), o('spacey', 'Spacey'),
    o('weightless', 'Weightless'), o('tranquil', 'Tranquil'), o('sleepy', 'Sleepy'), o('introspective', 'Introspective'), o('contemplative', 'Contemplative'),
  ]},
  { id: 'sad', label: 'Sad & Melancholic', options: [
    o('melancholic', 'Melancholic'), o('sad', 'Sad'), o('lonely', 'Lonely'), o('mournful', 'Mournful'), o('heartbroken', 'Heartbroken'),
    o('longing', 'Longing'), o('regretful', 'Regretful'), o('somber', 'Somber'), o('grieving', 'Grieving'), o('yearning', 'Yearning'),
    o('rainy', 'Rainy'), o('cold', 'Cold'), o('icy', 'Icy'), o('desolate', 'Desolate'), o('fragile', 'Fragile'),
  ]},
  { id: 'dark', label: 'Dark & Tense', options: [
    o('dark', 'Dark'), o('mysterious', 'Mysterious'), o('eerie', 'Eerie'), o('haunting', 'Haunting'), o('sinister', 'Sinister'),
    o('tense', 'Tense'), o('anxious', 'Anxious'), o('ominous', 'Ominous'), o('menacing', 'Menacing'), o('brooding', 'Brooding'),
    o('paranoid', 'Paranoid'), o('unsettling', 'Unsettling'), o('suspenseful', 'Suspenseful'), o('nocturnal', 'Nocturnal'), o('gothic', 'Gothic'),
    o('creepy', 'Creepy'), o('dystopian', 'Dystopian'),
  ]},
  { id: 'intense', label: 'Intense & Aggressive', options: [
    o('aggressive', 'Aggressive'), o('angry', 'Angry'), o('rebellious', 'Rebellious'), o('urgent', 'Urgent'), o('gritty', 'Gritty'),
    o('raw', 'Raw'), o('fierce', 'Fierce'), o('relentless', 'Relentless'), o('chaotic', 'Chaotic'), o('furious', 'Furious'),
    o('defiant', 'Defiant'), o('explosive', 'Explosive'), o('brutal', 'Brutal'), o('frantic', 'Frantic'),
  ]},
  { id: 'epic', label: 'Epic & Cinematic', options: [
    o('epic', 'Epic'), o('heroic', 'Heroic'), o('majestic', 'Majestic'), o('cinematic', 'Cinematic'), o('grand', 'Grand'),
    o('dramatic', 'Dramatic'), o('adventurous', 'Adventurous'), o('soaring', 'Soaring'), o('victorious', 'Victorious'), o('mythic', 'Mythic'),
    o('solemn', 'Solemn'), o('awe', 'Awe-Inspiring'), o('noble', 'Noble'),
  ]},
  { id: 'groove', label: 'Groove & Swagger', options: [
    o('confident', 'Confident'), o('cocky', 'Cocky'), o('sexy', 'Sexy'), o('groovy', 'Groovy'), o('funky', 'Funky'),
    o('energetic', 'Energetic'), o('bouncy', 'Bouncy'), o('slick', 'Slick'), o('cool', 'Cool'), o('swaggering', 'Swaggering'),
    o('hypnotic', 'Hypnotic'), o('driving', 'Driving'), o('sassy', 'Sassy'), o('flirty', 'Flirty'), o('laidback', 'Laid-back'),
  ]},
  { id: 'odd', label: 'Quirky & Psychedelic', options: [
    o('quirky', 'Quirky'), o('whimsical', 'Whimsical'), o('psychedelic', 'Psychedelic'), o('trippy', 'Trippy'), o('surreal', 'Surreal'),
    o('mischievous', 'Mischievous'), o('kitsch', 'Kitsch'), o('goofy', 'Goofy'), o('weird', 'Weird'), o('otherworldly', 'Otherworldly'),
    o('childlike', 'Childlike'), o('magical', 'Magical'), o('retro', 'Retro-Futuristic'),
  ]},
]
export const MOODS: Option[] = MOOD_GROUPS.flatMap((g) => g.options)

export const PROGRESSION_GROUPS: OptionGroup[] = [
  { id: 'classic', label: 'Classic Forms', options: [
    o('verse-chorus', 'Verse / Chorus', 'classic verse-chorus structure'),
    o('aaba', 'AABA', 'classic AABA song form with a contrasting bridge'),
    o('strophic', 'Strophic', 'strophic form, the same section repeated with new lyrics'),
    o('bluesform', '12-Bar Blues', 'twelve-bar blues form repeated'),
    o('ballad', 'Power Ballad', 'power-ballad arc, quiet start to a huge final chorus'),
    o('hookfirst', 'Hook First', 'opens straight on the chorus hook'),
    o('doublechorus', 'Double Chorus Ending', 'ends with a double chorus and a key change'),
  ]},
  { id: 'build', label: 'Builds & Crescendos', options: [
    o('build', 'Slow Build', 'slow gradual build-up'),
    o('minimal', 'Minimal Growth', 'minimal start, layers added over time'),
    o('crescendo', 'One Long Crescendo', 'one continuous crescendo to a final climax'),
    o('plateau', 'Plateau', 'quick rise to a steady high plateau held to the end'),
    o('terraced', 'Terraced', 'energy rising in clear steps, each section a level higher'),
    o('latebloom', 'Late Bloomer', 'stays restrained for most of the track, then opens up near the end'),
  ]},
  { id: 'drops', label: 'Drops & Release', options: [
    o('drops', 'Drop-Focused', 'tension and release with big drops'),
    o('breakdownheavy', 'Breakdown-Heavy', 'long emotional breakdowns between short peaks'),
    o('dj', 'DJ-Friendly', 'extended DJ-friendly intro and outro, steady core'),
    o('doubledrop', 'Double Drop', 'two drops, the second bigger than the first'),
    o('falsedrop', 'False Drop', 'a teased false drop before the real one'),
    o('peakearly', 'Peak Early', 'hits the peak early then rides the groove'),
  ]},
  { id: 'flow', label: 'Flow & Journey', options: [
    o('linear', 'Linear Journey', 'constantly evolving, no repetition'),
    o('loop', 'Loop-Based', 'hypnotic loop-based groove with subtle variation'),
    o('dynamic', 'Dynamic Waves', 'waves of intensity rising and falling'),
    o('cinematicarc', 'Cinematic Arc', 'story-like arc with a quiet beginning, conflict and resolution'),
    o('jam', 'Jam / Improvised', 'loose jam feel, sections flow into each other'),
    o('falling', 'Fade Down', 'starts at full power and gradually strips away'),
    o('circular', 'Circular', 'ends where it began, the intro motif returning as the outro'),
    o('throughcomposed', 'Through-Composed', 'through-composed, every section new, no repeats'),
    o('tidal', 'Tidal', 'long slow swells and recessions like tides'),
  ]},
  { id: 'contrast', label: 'Contrast & Shifts', options: [
    o('twopart', 'Two-Part Suite', 'two contrasting halves, a distinct second movement'),
    o('sudden', 'Sudden Shifts', 'abrupt changes in tempo and texture between sections'),
    o('medley', 'Medley', 'several distinct themes stitched together'),
    o('callresponse', 'Call & Response', 'call-and-response phrases driving the arrangement'),
    o('tempochange', 'Tempo Change', 'a deliberate tempo change midway'),
    o('halftimeswitch', 'Half-Time Switch', 'switches to half-time for the final section'),
    o('genreswitch', 'Genre Switch', 'switches genre for a section then returns'),
    o('quietloud', 'Quiet / Loud', 'quiet-loud-quiet dynamics in the grunge tradition'),
    o('threeact', 'Three Acts', 'three clear acts with distinct moods'),
  ]},
]
export const PROGRESSION_STYLES: Option[] = PROGRESSION_GROUPS.flatMap((g) => g.options)

export const VOCAL_GROUPS: OptionGroup[] = [
  { id: 'none', label: 'No Vocals', options: [
    o('none', 'Instrumental', 'instrumental, no vocals'),
    o('humming', 'Humming', 'wordless humming vocals'), o('oohs', 'Oohs & Aahs', 'wordless oohs and aahs'), o('vocalise', 'Vocalise', 'wordless vocalise melody'),
  ]},
  { id: 'female', label: 'Female', options: [
    o('female', 'Female Vocals', 'female vocals'), o('femalesoft', 'Soft Female', 'soft breathy female vocals'), o('femalepower', 'Powerful Female', 'powerful belting female vocals'),
    o('femalesoulful', 'Soulful Female', 'soulful female vocals with runs'), o('femalesmoky', 'Smoky Female', 'smoky husky female vocals'), o('femalebright', 'Bright Female', 'bright clear female pop vocals'),
    o('femalelow', 'Low Female', 'low contralto female vocals'), o('femaleairy', 'Airy Female', 'airy ethereal female vocals'), o('femaleraspy', 'Raspy Female', 'raspy rock female vocals'),
    o('femalejazz', 'Jazz Female', 'jazz female vocals, swung phrasing'), o('femalecountry', 'Country Female', 'country female vocals with twang'), o('femaleyoung', 'Youthful Female', 'youthful girlish female vocals'),
  ]},
  { id: 'male', label: 'Male', options: [
    o('male', 'Male Vocals', 'male vocals'), o('malesoft', 'Soft Male', 'soft intimate male vocals'), o('malepower', 'Powerful Male', 'powerful raspy male vocals'),
    o('deepmale', 'Deep Male', 'deep baritone male vocals'), o('malebass', 'Bass Male', 'very deep bass male vocals'), o('maletenor', 'Tenor Male', 'high tenor male vocals'),
    o('malesoulful', 'Soulful Male', 'soulful male vocals with runs'), o('malegravel', 'Gravelly Male', 'gravelly weathered male vocals'), o('malecrooner', 'Crooner', 'smooth crooner male vocals'),
    o('malejazz', 'Jazz Male', 'jazz male vocals, relaxed phrasing'), o('malecountry', 'Country Male', 'country male vocals with twang'), o('malesmooth', 'Smooth R&B Male', 'smooth r&b male vocals'),
    o('maleindie', 'Indie Male', 'understated indie male vocals'), o('malepunk', 'Punk Male', 'shouted punk male vocals'),
  ]},
  { id: 'range', label: 'Range & Character', options: [
    o('falsetto', 'Falsetto', 'falsetto vocals'), o('androgynous', 'Androgynous', 'androgynous vocals'), o('child', 'Childlike', 'youthful childlike vocals'),
    o('elderly', 'Elderly', 'aged weathered vocals'), o('opera', 'Operatic', 'operatic vocals'), o('soprano', 'Soprano', 'operatic soprano'),
    o('countertenor', 'Countertenor', 'countertenor vocals'), o('nasal', 'Nasal', 'nasal characterful vocals'), o('breathy', 'Breathy', 'breathy close-miked vocals'),
    o('belting', 'Belting', 'big belted vocals'), o('vibrato', 'Heavy Vibrato', 'vocals with wide vibrato'), o('flat', 'Deadpan', 'deadpan monotone delivery'),
  ]},
  { id: 'groups', label: 'Groups & Harmonies', options: [
    o('duet', 'Duet', 'male and female duet'), o('femaleduet', 'Female Duet', 'two female voices in harmony'), o('maleduet', 'Male Duet', 'two male voices in harmony'),
    o('harmonies', 'Stacked Harmonies', 'lush stacked vocal harmonies'), o('choir', 'Choir', 'layered choir vocals'), o('gospelchoir', 'Gospel Choir', 'gospel choir vocals'),
    o('childchoir', "Children's Choir", "children's choir"), o('barbershop', 'Barbershop', 'barbershop quartet harmonies'), o('girlgroup', 'Girl Group', 'girl group harmonies'),
    o('boyband', 'Boy Band', 'boy band harmonies'), o('crowd', 'Crowd Chant', 'crowd chant gang vocals'), o('callresponse', 'Call & Response', 'call-and-response lead and backing vocals'),
    o('backing', 'Lead + Backing', 'lead vocal with backing singers'),
  ]},
  { id: 'rap', label: 'Rap & Spoken', options: [
    o('rap', 'Rap', 'rap vocals'), o('femalerap', 'Female Rap', 'female rap vocals'), o('melodicrap', 'Melodic Rap', 'melodic autotuned rap vocals'),
    o('fastrap', 'Fast Rap', 'fast technical rap flow'), o('laidbackrap', 'Laid-back Rap', 'laid-back relaxed rap flow'), o('aggressiverap', 'Aggressive Rap', 'aggressive hard rap delivery'),
    o('oldschoolrap', 'Old-School Rap', 'old-school boom bap rap delivery'), o('drillrap', 'Drill Flow', 'drill-style sliding rap flow'), o('grimerap', 'Grime MC', 'grime mc delivery'),
    o('spoken', 'Spoken Word', 'spoken word vocals'), o('poetry', 'Poetry Reading', 'poetic spoken delivery'), o('narration', 'Narration', 'narrated storytelling voice'),
    o('toasting', 'Toasting', 'reggae toasting vocals'),
  ]},
  { id: 'extreme', label: 'Extreme & Expressive', options: [
    o('scream', 'Screamed', 'screamed harsh vocals'), o('growl', 'Growled', 'growled guttural vocals'), o('fry', 'Fry Scream', 'fry scream vocals'),
    o('shout', 'Shouted', 'shouted gang vocals'), o('whisper', 'Whispered', 'soft whispered vocals'), o('crying', 'Tearful', 'tearful emotional vocals'),
    o('laugh', 'Laughing', 'playful laughing vocals'), o('yodel', 'Yodel', 'yodelling vocals'), o('scat', 'Scat', 'jazz scat vocals'),
    o('throat', 'Throat Singing', 'throat singing'), o('ululation', 'Ululation', 'ululating vocals'), o('chant', 'Chanting', 'ritual chanting vocals'),
    o('beatboxvox', 'Beatbox + Vocals', 'lead vocals with beatboxing'),
  ]},
  { id: 'processed', label: 'Processed', options: [
    o('vocoder', 'Vocoder', 'vocoder and processed vocals'), o('autotune', 'Heavy Autotune', 'heavily autotuned vocals'), o('chopped', 'Chopped Vocals', 'chopped and pitched vocal samples'),
    o('pitched', 'Pitched-Up', 'pitched-up chipmunk vocals'), o('pitcheddown', 'Pitched-Down', 'pitched-down slowed vocals'), o('telephone', 'Telephone FX', 'telephone-filtered vocals'),
    o('reverbvox', 'Drenched in Reverb', 'vocals drenched in reverb'), o('doubled', 'Doubled', 'doubled tracked vocals'), o('robotic', 'Robotic', 'robotic synthetic vocals'),
    o('distortedvox', 'Distorted', 'distorted overdriven vocals'), o('harmonizer', 'Harmonizer', 'harmonizer-stacked vocals'), o('glitchvox', 'Glitched', 'glitched stuttering vocals'),
  ]},
]
export const VOCALS: Option[] = VOCAL_GROUPS.flatMap((g) => g.options)

export const ERAS: Option[] = [
  o('none', 'Any'), o('60s', '60s', '1960s style'), o('70s', '70s', '1970s style'),
  o('80s', '80s', '1980s style'), o('90s', '90s', '1990s style'), o('2000s', '2000s', '2000s style'),
  o('2010s', '2010s', '2010s style'), o('modern', 'Modern', 'modern polished production'),
  o('futuristic', 'Futuristic', 'futuristic sound design'),
]

export const PRODUCTION_GROUPS: OptionGroup[] = [
  { id: 'character', label: 'Character', options: [
    o('clean', 'Clean & Polished', 'clean polished mix'), o('raw', 'Raw & Unpolished', 'raw unpolished sound'), o('lofi', 'Lo-fi', 'lo-fi texture'),
    o('vintage', 'Vintage', 'vintage recording character'), o('analog', 'Analog Warmth', 'analog warmth'), o('digital', 'Crisp Digital', 'crisp digital clarity'),
    o('studio', 'Studio Session', 'professional studio session sound'), o('demo', 'Demo Tape', 'rough demo tape feel'), o('live', 'Live Feel', 'live room feel'),
    o('orchestralmix', 'Cinematic Mix', 'cinematic film-score mix'),
  ]},
  { id: 'tone', label: 'Tone & Low End', options: [
    o('bright', 'Bright & Airy', 'bright airy top end'), o('dark', 'Dark & Muffled', 'dark muffled tone'), o('subheavy', 'Sub-Heavy', 'deep sub-heavy low end'),
    o('punchy', 'Punchy', 'punchy compressed drums'), o('tape', 'Tape Saturation', 'tape saturation'), o('distorted', 'Distorted', 'distorted saturated mix'),
    o('bitcrushed', 'Bitcrushed', 'bitcrushed textures'), o('cassette', 'Cassette', 'cassette tape sound'),
  ]},
  { id: 'space', label: 'Space & Width', options: [
    o('wide', 'Wide Stereo', 'wide stereo image'), o('mono', 'Mono / Narrow', 'narrow mono-style image'), o('reverb', 'Reverb-Heavy', 'lush reverb'),
    o('dry', 'Dry & Intimate', 'dry intimate mix'), o('acousticroom', 'Room Mics', 'natural room microphones'), o('headphone', 'Headphone Mix', 'headphone-focused spatial mix'),
    o('binaural', 'Binaural / 3D', 'binaural 3D spatial effects'),
  ]},
  { id: 'fx', label: 'Effects & Edits', options: [
    o('sidechain', 'Sidechain Pump', 'sidechain pumping'), o('stereodelay', 'Delay-Heavy', 'rhythmic delay throws'), o('chorus', 'Chorus FX', 'chorus and modulation effects'),
    o('phaser', 'Phaser / Flanger', 'phaser and flanger sweeps'), o('filtered', 'Filter Sweeps', 'filter sweeps and automation'), o('lowpass', 'Low-Pass Intro', 'low-pass filtered sections'),
    o('glitch', 'Glitchy', 'glitchy edits'), o('stutter', 'Stutter Edits', 'stutter edits and chops'), o('halftime', 'Half-Time FX', 'half-time effects'),
    o('minimalfx', 'Minimal FX', 'minimal effects, natural tone'),
  ]},
  { id: 'density', label: 'Density & Dynamics', options: [
    o('layered', 'Densely Layered', 'densely layered arrangement'), o('sparse', 'Sparse Mix', 'sparse minimal mix'), o('dynamic', 'Dynamic', 'dynamic mix with headroom'),
    o('loud', 'Loud & Dense', 'loud dense master'),
  ]},
  { id: 'master', label: 'Mastering Target', options: [
    o('radio', 'Radio-Ready', 'radio-ready mastering'), o('club', 'Club Master', 'club-ready master'), o('vinylmaster', 'Vinyl Master', 'vinyl-style mastering'),
  ]},
]
export const PRODUCTION: Option[] = PRODUCTION_GROUPS.flatMap((g) => g.options)

export const KEYS = ['Any', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const SCALES = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'harmonic minor', 'pentatonic']

export interface SectionType { id: string; label: string; weight: number }
export const SECTION_TYPES: SectionType[] = [
  { id: 'Intro', label: 'Intro', weight: 1 },
  { id: 'Verse', label: 'Verse', weight: 2 },
  { id: 'Pre-Chorus', label: 'Pre-Chorus', weight: 1 },
  { id: 'Chorus', label: 'Chorus', weight: 2 },
  { id: 'Build', label: 'Build', weight: 1.5 },
  { id: 'Drop', label: 'Drop', weight: 2 },
  { id: 'Breakdown', label: 'Breakdown', weight: 1.5 },
  { id: 'Bridge', label: 'Bridge', weight: 1.5 },
  { id: 'Solo', label: 'Solo', weight: 1.5 },
  { id: 'Outro', label: 'Outro', weight: 1 },
]

export const ARRANGEMENT_GROUPS: OptionGroup[] = [
  { id: 'standard', label: 'Standard', options: [
    o('full', 'Full Production', ''),
    o('band', 'Small Band', 'small band: drums, bass, guitar, keys'),
    o('electronicArr', 'Electronic Only', 'fully electronic arrangement, synths and drum machines only'),
    o('hybrid', 'Hybrid Live + Electronic', 'hybrid of live instruments and electronic production'),
    o('lofiArr', 'Lo-fi Bedroom', 'lo-fi bedroom production, intimate and hazy'),
    o('wallofsound', 'Wall of Sound', 'dense wall-of-sound arrangement, everything layered'),
    o('live', 'Live Session', 'live session recording'),
  ]},
  { id: 'vocal', label: 'Vocal-Led', options: [
    o('acapella', 'Acapella', 'acapella, vocal-led, voices carry the whole arrangement'),
    o('beatbox', 'Beatbox Acapella', 'beatbox acapella, drums and bass performed by mouth, vocal harmonies carry the arrangement'),
    o('choirArr', 'Choir & Organ', 'choir and organ arrangement'),
    o('gospel', 'Gospel Choir & Band', 'gospel choir with piano, organ and rhythm section'),
    o('vocalgroup', 'Vocal Group', 'vocal harmony group with light backing'),
  ]},
  { id: 'acoustic', label: 'Acoustic & Intimate', options: [
    o('unplugged', 'Unplugged', 'unplugged acoustic arrangement, no electronic elements'),
    o('stripped', 'Stripped Back', 'stripped-back minimal arrangement'),
    o('pianovocal', 'Piano & Voice', 'piano and voice only'),
    o('guitarvocal', 'Guitar & Voice', 'solo guitar and voice'),
    o('solo', 'Solo Instrument', 'a single solo instrument, unaccompanied'),
    o('duo', 'Duo', 'two instruments in dialogue'),
    o('trio', 'Trio', 'a three-piece acoustic trio'),
    o('campfire', 'Campfire', 'campfire sing-along with acoustic guitar and group vocals'),
    o('folkensemble', 'Folk Ensemble', 'folk ensemble with fiddle, mandolin, guitar and upright bass'),
  ]},
  { id: 'orchestral', label: 'Orchestral & Classical', options: [
    o('orchestralArr', 'Orchestral Version', 'full orchestral arrangement'),
    o('quartet', 'String Quartet', 'string quartet arrangement'),
    o('chamber', 'Chamber Ensemble', 'small chamber ensemble arrangement'),
    o('pianoconcerto', 'Piano & Orchestra', 'piano with orchestral accompaniment'),
    o('epicorchestral', 'Epic Orchestral + Choir', 'epic trailer-style orchestra with choir and big percussion'),
    o('brassband', 'Brass Band', 'brass band arrangement'),
    o('marching', 'Marching Band', 'marching band with drumline and brass'),
    o('windensemble', 'Wind Ensemble', 'wind ensemble of woodwinds and brass'),
  ]},
  { id: 'jazz', label: 'Jazz & Soul', options: [
    o('bigband', 'Big Band', 'big band arrangement with full horn section'),
    o('jazztrio', 'Jazz Trio', 'jazz trio: piano, upright bass, drums'),
    o('jazzcombo', 'Jazz Combo', 'jazz combo with horns and rhythm section'),
    o('soulband', 'Soul Band', 'soul band with horn section, keys and backing vocals'),
    o('lounge', 'Lounge', 'lounge arrangement, smooth and understated'),
    o('funkband', 'Funk Band', 'tight funk band with horn stabs and clavinet'),
  ]},
  { id: 'electronic', label: 'Club & Electronic', options: [
    o('clubedit', 'Club Edit', 'extended club edit with DJ-friendly intro and outro'),
    o('remix', 'Remix Version', 'remix-style rework with a new beat under the original hooks'),
    o('radioedit', 'Radio Edit', 'tight radio edit, straight to the hook'),
    o('dubversion', 'Dub Version', 'dub version with stripped vocals, echo and delay throws'),
    o('ambientArr', 'Ambient Soundscape', 'beatless ambient soundscape'),
    o('modularjam', 'Modular Jam', 'modular synth jam, evolving and hands-on'),
    o('liveelectronic', 'Live Electronic Set', 'live electronic performance feel with hardware'),
  ]},
  { id: 'world', label: 'World & Traditional', options: [
    o('latinband', 'Latin Band', 'latin band with percussion section, horns and piano montuno'),
    o('afroensemble', 'Afro Ensemble', 'afrobeat ensemble with layered percussion, guitars and horns'),
    o('reggaeband', 'Reggae Band', 'reggae band with skank guitar, organ bubble and deep bass'),
    o('mariachiArr', 'Mariachi', 'mariachi ensemble with trumpets, violins and guitarrón'),
    o('celticArr', 'Celtic Session', 'celtic session with fiddle, whistle, bodhrán and guitar'),
    o('indianensemble', 'Indian Ensemble', 'indian ensemble with sitar, tabla and tanpura'),
    o('flamencoArr', 'Flamenco', 'flamenco guitar, palmas and cajón'),
    o('gamelan', 'Gamelan', 'gamelan ensemble'),
  ]},
]
export const ARRANGEMENTS: Option[] = ARRANGEMENT_GROUPS.flatMap((g) => g.options)
