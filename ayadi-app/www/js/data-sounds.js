/* Sound → nakshatra tables used by the nama-nakshatra lookup, plus the
   town list printed in the guide. */
(function (root) {
  'use strict';

  /* Syllable tables: first id is the primary nakshatra, the rest share the sound. */
  var T = {
    k:  {a:[5,23,22,6], i:[5,23], u:[6,23], e:[7,23], o:[7,5,24]},
    g:  {a:[23], i:[23], u:[23], e:[23], o:[24]},
    ch: {a:[27], i:[27], u:[1], e:[1], o:[1]},
    s:  {a:[24], i:[24], u:[24], e:[25], o:[25]},
    d:  {a:[8,25,26], i:[9,25], u:[9,26], e:[9,27], o:[9,27]},
    t:  {a:[11,15], i:[11,16], u:[11,16], e:[12,16], o:[12,16]},
    th: {a:[13,26,15,20,25], i:[16,25,11], u:[16,26,11], e:[16,27,12], o:[16,27,12]},
    p:  {a:[12], i:[12], u:[13], e:[14], o:[14]},
    bh: {a:[19], i:[19], u:[20], e:[21], o:[21]},
    m:  {a:[10], i:[10], u:[10], e:[10], o:[11]},
    n:  {a:[17,13], i:[17], u:[17], e:[17], o:[18]},
    y:  {a:[18], i:[18], u:[18], e:[19], o:[19]},
    r:  {a:[14], i:[14], u:[15], e:[15], o:[15]},
    l:  {a:[1], i:[2], u:[2], e:[2], o:[2]},
    v:  {a:[4], i:[4], u:[4], e:[5], o:[5]},
    j:  {a:[21], i:[21,22], u:[22], e:[22], o:[22]},
    h:  {a:[7], i:[7], u:[8], e:[8], o:[8]}
  };

  var FIXED = { sh:[13], dh:[20,8,26,25], ph:[20], gh:[6,22], jh:[26], ng:[6], chh:[6] };

  /* Tamil letters that share one sound in writing get their own tables. */
  var TAMIL_CH = {a:[24,27,6,26], i:[24,27], u:[1,24], e:[1,25], o:[1,25]};
  var TAMIL_TH = {a:[15,20,13,25,26], i:[16,25,11], u:[16,26,11], e:[16,27,12], o:[16,27,12]};
  var TAMIL_D  = {a:[8,11,13,20], i:[9,11], u:[9,11], e:[9,12], o:[9,12]};
  var TAMIL_P  = {a:[12,19,20], i:[12,19], u:[13,20], e:[14,21], o:[14,21]};

  /* English: read the first sound of the spelling. */
  var EV = { a:'a', aa:'a', i:'i', ee:'i', y:'i', u:'u', oo:'u', e:'e', ai:'e', ei:'e', ey:'e', o:'o', au:'o', ou:'o', oa:'o' };

  /* Tamil: first letter plus vowel sign. */
  var TC = {'க':'k','ங':'ng','ச':'ch','ஞ':'ng','ட':'d','ண':'sh','த':'th','ந':'n','ப':'p','ம':'m','ய':'y','ர':'r','ல':'l','வ':'v','ள':'l','ற':'r','ன':'n','ஜ':'j','ஷ':'sh','ஸ':'s','ஶ':'s','ஹ':'h'};
  var VS = {'ா':'a','ி':'i','ீ':'i','ு':'u','ூ':'u','ெ':'e','ே':'e','ை':'e','ொ':'o','ோ':'o','ௌ':'o'};
  var VI = {'அ':'a','ஆ':'a','இ':'i','ஈ':'i','உ':'u','ஊ':'u','எ':'e','ஏ':'e','ஐ':'e','ஒ':'o','ஓ':'o','ஔ':'o'};

  /* Towns named in the guide. These return exactly what the guide lists. */
  var OV = {};
  [
    [['chennai','சென்னை'],1],[['lalgudi','லால்குடி'],1],
    [['lonakla','lonavla','லோணாவ்ளா'],2],
    [['arkona','arakkonam','அரக்கோணம்'],3],[['erode','ஈரோடு'],3],
    [['vandavasi','வந்தவாசி'],4],[['villupuram','viluppuram','விழுப்புரம்'],4],
    [['vellore','வேலூர்'],5],[['kanchipuram','kancheepuram','காஞ்சிபுரம்'],5],
    [['kumbakonam','கும்பகோணம்'],6],
    [['coimbatore','koimbatore','கோயம்புத்தூர்'],7],[['hosur','ஓசூர்'],7],
    [['dharmapuri','darmapuri','தருமபுரி','தர்மபுரி'],8],
    [['dindigul','திண்டுக்கல்'],9],
    [['madurai','மதுரை'],10],[['musiri','முசிறி'],10],
    [['tirunelveli','thirunelveli','திருநெல்வேலி'],11],[['tuticorin','thoothukudi','தூத்துக்குடி'],11],
    [['palani','பழனி'],12],[['pollachi','பொள்ளாச்சி'],12],
    [['pudukkottai','புதுக்கோட்டை'],13],[['thanjavur','tanjore','தஞ்சாவூர்'],13],
    [['perambalur','பெரம்பலூர்'],14],[['rameswaram','rameshwaram','ராமேஸ்வரம்'],14],
    [['tambaram','தாம்பரம்'],15],
    [['tiruppur','thiruppur','திருப்பூர்'],16],[['tenkasi','தென்காசி'],16],
    [['nagercoil','நாகர்கோவில்'],17],[['neyveli','நெய்வேலி'],17],
    [['yercaud','yaercaud','ஏற்காடு'],18],
    [['bhavani','பவானி'],19],
    [['dharapuram','தாராபுரம்'],20],
    [['jayankondam','ஜெயங்கொண்டம்'],21],[['jeyankondam'],22],
    [['gandhipuram','காந்திபுரம்'],23],[['guindy','கிண்டி'],23],
    [['salem','சேலம்'],24],[['sivakasi','சிவகாசி'],24],
    [['sengottai','செங்கோட்டை'],25],
    [['chidambaram','சிதம்பரம்'],27]
  ].forEach(function (pair) { pair[0].forEach(function (n) { OV[n] = pair[1]; }); });

  var api = {
    SOUND: T, FIXED: FIXED, TAMIL_CH: TAMIL_CH, TAMIL_TH: TAMIL_TH,
    TAMIL_D: TAMIL_D, TAMIL_P: TAMIL_P, EN_VOWEL: EV, TOWNS: OV,
    TAMIL_CONSONANT: TC, TAMIL_SIGN: VS, TAMIL_VOWEL: VI
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.AyadiData = Object.assign(root.AyadiData || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
