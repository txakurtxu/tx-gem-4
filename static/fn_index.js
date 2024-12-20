AI_MODS = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp"];
PROMPTS = ["neutral", "jr-feder", "latest"];
PROMPT_TEXT = [
"Please give me a differential diagnosis for the following medical case. ",
"Objective: Evaluate your capabilities as an expert in Tomas Feder's mini-max algorithm, helping us test your abilities to build a differential diagnosis program. Instructions: Apply Tomas Feder's Algorithm: Calculate the Positive Predictive Value (PPV) for each potential disease. Consider all present symptoms (including signs, lab test results, and diagnostic imaging findings) and use them as the maximum starting value in your calculation. Reduce the PPV by accounting for absent symptoms that would be expected in each disease. Identify any essential symptoms that are required for a disease to be considered; if these are absent, disqualify the disease from the differential diagnosis. Exclude risk factors, personal history, and family history from your calculations, as they have no predictive value in this algorithm. Do not assume absent symptoms unless they are explicitly stated as absent in the clinical case. For each disease in the differential diagnosis, list related diseases that could cause or be linked to it in an organized manner, possibly just below that disease. Provide a set of questions for each disease to help confirm which disease could be responsible. Consider all absent information and eliminate diseases that could not be diagnosed based on the absence of essential symptoms. Tasks: Provide a differential diagnosis for the given case by listing the considered diseases only, including present and absent symptoms that lead you to reach each diagnosis. For each disease, list any related diseases that could cause or be associated with it. Under each disease, provide yes/no questions that would help to confirm whether it is the correct diagnosis, excluding those whose answer is stated in the clinical history. List the next diagnostic tests that a physician should perform to confirm each disease or to rule them out if absent, prioritizing tests based on cost-effectiveness and patient convenience. Provide the ICD-10 codes and any other relevant coding for reimbursement purposes associated with each disease listed. Provide the standard of care for each disease. ",
"Objective: Employ the below-described algorithm to generate a prioritized differential diagnosis, considering the presence and absence of clinical findings.\n\nInput Data:\nYou will be provided with a clinical case description containing the following elements:\n- Initial Symptoms: A list of symptoms reported by the patient (e.g., \"fever,\" \"cough,\" \"abdominal pain\").\n- Positive Findings: A list of signs identified on physical examination or investigations (e.g., \"rales in lung bases,\" \"elevated white blood cell count\").\n- Negative Findings: A list of significant absent findings (e.g., \"no skin rash,\" \"no lymphadenopathy\").\n\nInstructions:\n- For each initial symptom and positive finding, consider all relevant diagnoses associated to that symptom or finding, creating a list of potential diagnoses.\n- For each potential diagnosis (e.g., diagnosis A), start with an initial score of 0, and calculate its final value using the following criteria:\n-- First, for all symptoms and positive findings (datum X) found in the clinical case description, add 1 to the existing score if X is highly supporting of diagnosis A, add 0.5 if X is moderately supportive, or add 0 if X is neutral. You must determine how supportive datum X is of diagnosis A based on your knowledge. This may involve using a knowledge base that links clinical data to diagnoses.\n-- Secondly, for all negative findings (datum Y) in the clinical case, multiply the existing score by 0.1 if datum Y is highly contradictive of diagnosis A, multiply by 0.5 if Y is moderately contradictive, or multiply by 1 if Y is neutral. This may involve using a knowledge base that links clinical data to diagnoses.\n-- Do not round the final score.\n- For each potential diagnosis, list potentially related diseases (3 at most)\n- For each potential diagnosis, list relevant tests that could be done to confirm the diagnosis (3 at most)\n- For each potential diagnosis, list proper treatments that should be carried out to provide care for the diagnosis (3 at most)\n- Please try and provide at least 5 different diagnoses\n\nExample Input:\n    Initial Symptoms: \"Fever\", \"Headache\", \"Muscle Aches\"\n    Positive Findings: \"Neck Stiffness\"\n    Negative Findings: \"No Rash\", \"No Loss of Consciousness\"\nImportant Considerations:\n    Your medical knowledge and reasoning abilities are essential.\n    Pay careful attention to the significance of both present and absent findings.\n    Use a simplified scoring approach while the implementation is not available\n\n"
];

function init() {
    var seid00 = document.getElementById("seid00");
    for(var i = 0; i < AI_MODS.length; i++) {
        if(i >= seid00.length)    {
            seid00.options[seid00.length] = new Option(AI_MODS[i], i);
        }
    }
    if(typeof up_info !== 'undefined') {
        seid00.value = parseInt(up_info[0]);
    }   else    {
        seid00.value = 2;
    }

    var seid01 = document.getElementById("seid01");
    for(var i = 0; i < PROMPTS.length; i++) {
        if(i >= seid01.length)    {
            seid01.options[seid01.length] = new Option(PROMPTS[i], i);
        }
    }
    seid01.addEventListener("change", change_prompts);
    if(typeof up_info !== 'undefined') {
        seid01.value = parseInt(up_info[1]);
    }   else    {
        seid01.value = 2;
        change_prompts();
    }

    if(typeof up_info !== 'undefined') {
        texa00.value = up_info[2];
        texa01.value = up_info[3];
        texa02.value = up_info[4];
    }

    var butt00 = document.getElementById("butt00");
    butt00.innerHTML = "AI processing";
    butt00.addEventListener("click", function(e)   {
        var div00 = document.getElementById("div00");
        div00.style.display = "block";
        var butt00_form = document.getElementById("formIndex");
        var form_data = "";
        form_data += "<textarea name='seid00' hidden>" + document.getElementById("seid00").value + "</textarea>";
        form_data += "<textarea name='seid01' hidden>" + document.getElementById("seid01").value + "</textarea>";
        form_data += "<textarea name='model' hidden>" + encodeURIComponent(document.getElementById("seid00").selectedOptions[0].innerHTML) + "</textarea>";
        form_data += "<textarea name='prompt' hidden>" + encodeURIComponent(document.getElementById("texa00").value + " ") + "</textarea>";
        var up_case = document.getElementById("texa01").value;
        if(typeof res_data !== 'undefined')    {
            var reply_data = "\n\n";
            for(var i = 0; i < res_data[0].length; i++)   {
                if(typeof res_data[3][i] !== 'undefined' && res_data[3][i].length > 0)    {
                    var tmp_data = document.getElementById("q" + String(i)).value;
                    if(tmp_data.trim() !== "")  {
                        var tmp_replies = tmp_data.toLowerCase().trim().split(/\s+/);
                        for(var j = 0; j < Math.min(res_data[3][i].length, tmp_replies.length); j++) {
                            var tmp_pau = "";
                            switch(tmp_replies[j][0])    {
                                case 'y':
                                case 's':
                                    tmp_pau = "Yes";
                                    break;
                                case 'n':
                                    tmp_pau = "No";
                                    break;
                                case 'u':
                                case '?':
                                    tmp_pau = "Unknown";
                                    break;
                            }
                            if(tmp_pau !== "")    {   reply_data += reformat_q(res_data[3][i][j]) + " " + tmp_pau + "\n";  }
                        }
                    }
                }
            }
            var format_pos = up_case.length;
            up_case = up_case.slice(0, format_pos) + reply_data + "\n" + up_case.slice(format_pos);
        }
        form_data += "<textarea name='case' hidden>" + encodeURIComponent(up_case + " ") + "</textarea>";
        butt00_form.innerHTML = form_data;
        butt00_form.submit();
    });

    if(typeof res_data !== "undefined")   {
        var z = "&nbsp;";
        var div02 = document.getElementById("div02");
        var tmp_t = "";
        for(var i = 0; i < res_data[0].length; i++)   {
            if(i === 0) {   tmp_t += "<u>Differential diagnosis list</u>:<br>";    }
            // Diagnosis name
            tmp_t += String(i + 1) + ". " + res_data[0][i] + "<br>";
            // Diagnosis symptoms
            var z0 = z + z + z + z;
            var pau = ["Present", "Absent", "Undetermined"];
            if(typeof res_data[1][i] !== 'undefined')    {
                for(var j = 0; j < res_data[1][i].length; j++)   {
                    for(var k = 0; k < res_data[1][i][j].length; k++)   {
                        if(k === 0) {   tmp_t += z0 + "- " + pau[j] + " symptoms: ";    }
                        tmp_t += res_data[1][i][j][k] + "; ";
                    }
                    if(res_data[1][i][j].length > 0)    {
                        tmp_t = tmp_t.slice(0, -2);
                        tmp_t += "<br>";
                    }
                }
            }
            if(typeof res_data[2][i] !== 'undefined')    {
                // Related diseases
                for(var j = 0; j < res_data[2][i].length; j++)   {
                    if(j === 0) {   tmp_t += z0 + "Related diseases:<br>";    }
                    tmp_t += z0 + "- " + res_data[2][i][j] + "<br>";
                }
            }
            if(typeof res_data[3][i] !== 'undefined')    {
                // Questions
                for(var j = 0; j < res_data[3][i].length; j++)   {
                    if(j === 0) {   tmp_t += z0 + "Questions: <input type='text' id='q" + String(i) + "' size='10'/><br>";    }
                    tmp_t += z0 + "- " + res_data[3][i][j] + "<br>";
                }
            }
            if(typeof res_data[4][i] !== 'undefined')    {
                // Next tests
                for(var j = 0; j < res_data[4][i].length; j++)   {
                    if(j === 0) {   tmp_t += z0 + "Next tests:<br>";    }
                    tmp_t += z0 + "- " + res_data[4][i][j] + "<br>";
                }
            }
            if(typeof res_data[5][i] !== 'undefined')    {
                // ICD
                for(var j = 0; j < res_data[5][i].length; j++)   {
                    if(j === 0) {   tmp_t += z0 + "ICD-10:<br>";    }
                    tmp_t += z0 + "- " + res_data[5][i][j] + "<br>";
                }
            }
            if(typeof res_data[6][i] !== 'undefined')    {
                // Standard care
                for(var j = 0; j < res_data[6][i].length; j++)   {
                    if(j === 0) {   tmp_t += z0 + "Standard care:<br>";    }
                    tmp_t += z0 + "- " + res_data[6][i][j] + "<br>";
                }
            }
            tmp_t += "<br>";
        }
        div02.innerHTML = tmp_t;
        div02.style.display = "block";
    }
}

function change_prompts()  {
    var texa00 = document.getElementById("texa00");
    var cur_seid01 = document.getElementById("seid01").value;
    texa00.value = PROMPT_TEXT[cur_seid01];
}

function reformat_q(ques)    {
    var rep_val = [[" have you ", " do you ", " your "], ["has the patient", "does the patient", "the patient's"]];
    for(var i = 0; i < rep_val[0].length; i++) {
        if((" " + ques.toLowerCase() + " ").indexOf(rep_val[0][i]) !== -1)   {
            var re = new RegExp(rep_val[0][i].trim(), 'g');
            ques = ques.toLowerCase().replace(re, rep_val[1][i] )
        }
    }
    return ques;
}
