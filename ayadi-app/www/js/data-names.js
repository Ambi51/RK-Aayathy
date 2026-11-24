/* Nakshatra chart: number, Tamil name, English name, rasi, English sounds,
   and the Tamil syllables of the four padams as printed in the guide. */
(function (root) {
  'use strict';

  var NN = [
    ['அஸ்வினி','Ashwini','மேஷம்','Chu, Che, Cho, La'],
    ['பரணி','Bharani','மேஷம்','Li, Lu, Le, Lo'],
    ['கார்த்திகை','Krittika','மேஷம் / ரிஷபம்','A, I, U, E'],
    ['ரோகிணி','Rohini','ரிஷபம்','O, Va, Vi, Vu'],
    ['மிருகசீரிடம்','Mrigashirsha','ரிஷபம் / மிதுனம்','Ve, Vo, Ka, Ki'],
    ['திருவாதிரை','Ardra','மிதுனம்','Ku, Gha, Ng, Chha'],
    ['புனர்பூசம்','Punarvasu','மிதுனம் / கடகம்','Ke, Ko, Ha, Hi'],
    ['பூசம்','Pushya','கடகம்','Hu, He, Ho, Da'],
    ['ஆயில்யம்','Ashlesha','கடகம்','Di, Du, De, Do'],
    ['மகம்','Magha','சிம்மம்','Ma, Mi, Mu, Me'],
    ['பூரம்','Purva Phalguni','சிம்மம்','Mo, Ta, Ti, Tu'],
    ['உத்திரம்','Uttara Phalguni','சிம்மம் / கன்னி','Te, To, Pa, Pi'],
    ['அஸ்தம்','Hasta','கன்னி','Pu, Sha, Na, Tha'],
    ['சித்திரை','Chitra','கன்னி / துலாம்','Pe, Po, Ra, Ri'],
    ['சுவாதி','Swati','துலாம்','Ru, Re, Ro, Ta'],
    ['விசாகம்','Vishakha','துலாம் / விருச்சிகம்','Ti, Tu, Te, To'],
    ['அனுஷம்','Anuradha','விருச்சிகம்','Na, Ni, Nu, Ne'],
    ['கேட்டை','Jyeshtha','விருச்சிகம்','No, Ya, Yi, Yu'],
    ['மூலம்','Mula','தனுசு','Ye, Yo, Bha, Bhi'],
    ['பூராடம்','Purva Ashadha','தனுசு','Bhu, Dha, Pha, Dha'],
    ['உத்திராடம்','Uttara Ashadha','தனுசு / மகரம்','Bhe, Bho, Ja, Ji'],
    ['திருவோணம்','Shravana','மகரம்','Ju, Je, Jo, Gha'],
    ['அவிட்டம்','Dhanishta','மகரம் / கும்பம்','Ga, Gi, Gu, Ge'],
    ['சதயம்','Shatabhisha','கும்பம்','Go, Sa, Si, Su'],
    ['பூரட்டாதி','Purva Bhadrapada','கும்பம் / மீனம்','Se, So, Da, Di'],
    ['உத்திரட்டாதி','Uttara Bhadrapada','மீனம்','Du, Tha, Jha, Da'],
    ['ரேவதி','Revati','மீனம்','De, Do, Cha, Chi']
  ];

  var TL = ['சு, சே, சோ, ல','லி, லு, லே, லோ','அ, இ, உ, எ','ஒ, வ, வி, வு','வே, வோ, க, கி','கு, க, ங, ச','கே, கோ, ஹ, ஹி','ஹு, ஹே, ஹோ, டா','டி, டு, டே, டோ','ம, மி, மு, மே','மோ, ட, டி, டு','டே, டோ, ப, பி','பூ, ஷ, ண, ட','பே, போ, ர, ரி','ரு, ரே, ரோ, த','தி, து, தே, தோ','ந, நி, நு, நே','நோ, ய, யி, யு','யே, யோ, ப, பி','பூ, த, ப, ட','பே, போ, ஜ, ஜி','ஜீ, ஜே, ஜோ, கா','க, கீ, கு, கெ','கோ, ஸா, ஸி, ஸு','ஸே, ஸோ, த, தீ','து, ஸ்ரீ, ச','தே, தோ, ச, சி'];

  NN.forEach(function (row, i) { row.push(TL[i]); });

  var api = { CHART: NN, CHART_TAMIL: TL };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.AyadiData = Object.assign(root.AyadiData || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
