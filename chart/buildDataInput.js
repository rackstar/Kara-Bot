a = {  "document_tone": {
    "tone_categories": [
      {
        "tones": [
          {
            "score": 0.019609,
            "tone_id": "anger",
            "tone_name": "Anger"
          },
          {
            "score": 0.11314,
            "tone_id": "disgust",
            "tone_name": "Disgust"
          },
          {
            "score": 0.153656,
            "tone_id": "fear",
            "tone_name": "Fear"
          },
          {
            "score": 0.675573,
            "tone_id": "joy",
            "tone_name": "Joy"
          },
          {
            "score": 0.151111,
            "tone_id": "sadness",
            "tone_name": "Sadness"
          }
        ],
        "category_id": "emotion_tone",
        "category_name": "Emotion Tone"
      },
      {
        "tones": [
          {
            "score": 0,
            "tone_id": "analytical",
            "tone_name": "Analytical"
          },
          {
            "score": 0,
            "tone_id": "confident",
            "tone_name": "Confident"
          },
          {
            "score": 0,
            "tone_id": "tentative",
            "tone_name": "Tentative"
          }
        ],
        "category_id": "writing_tone",
        "category_name": "Writing Tone"
      },
      {
        "tones": [
          {
            "score": 0.079,
            "tone_id": "openness_big5",
            "tone_name": "Openness"
          },
          {
            "score": 0.56,
            "tone_id": "conscientiousness_big5",
            "tone_name": "Conscientiousness"
          },
          {
            "score": 0.951,
            "tone_id": "extraversion_big5",
            "tone_name": "Extraversion"
          },
          {
            "score": 0.763,
            "tone_id": "agreeableness_big5",
            "tone_name": "Agreeableness"
          },
          {
            "score": 0.375,
            "tone_id": "neuroticism_big5",
            "tone_name": "Emotional Range"
          }
        ],
        "category_id": "social_tone",
        "category_name": "Social Tone"
      }
    ]
  }
}

var wrapper = [];
for (var i = 0; i < a.document_tone.tone_categories.length; i++) {
  
  var obj = {};
  obj[a.document_tone.tone_categories[i].category_name] = {};
  
  for (var j = 0; j < a.document_tone.tone_categories[i].tones.length; j++) {
    obj[a.document_tone.tone_categories[i].category_name][a.document_tone.tone_categories[i].tones[j].tone_name] = a.document_tone.tone_categories[i].tones[j].score
  }
   
  wrapper.push(obj);

}

console.log(JSON.stringify(wrapper[2]))





