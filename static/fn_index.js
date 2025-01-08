AI_MODS = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp"];
PROMPTS = ["neutral", "jr-feder", "latest"];
PROMPT_TEXT = [
"Please give me a differential diagnosis for the following medical case. ",
"Objective: Evaluate your capabilities as an expert in Tomas Feder's mini-max algorithm, helping us test your abilities to build a differential diagnosis program. Instructions: Apply Tomas Feder's Algorithm: Calculate the Positive Predictive Value (PPV) for each potential disease. Consider all present symptoms (including signs, lab test results, and diagnostic imaging findings) and use them as the maximum starting value in your calculation. Reduce the PPV by accounting for absent symptoms that would be expected in each disease. Identify any essential symptoms that are required for a disease to be considered; if these are absent, disqualify the disease from the differential diagnosis. Exclude risk factors, personal history, and family history from your calculations, as they have no predictive value in this algorithm. Do not assume absent symptoms unless they are explicitly stated as absent in the clinical case. For each disease in the differential diagnosis, list related diseases that could cause or be linked to it in an organized manner, possibly just below that disease. Provide a set of questions for each disease to help confirm which disease could be responsible. Consider all absent information and eliminate diseases that could not be diagnosed based on the absence of essential symptoms. Tasks: Provide a differential diagnosis for the given case by listing the considered diseases only, including present and absent symptoms that lead you to reach each diagnosis. For each disease, list any related diseases that could cause or be associated with it. Under each disease, provide yes/no questions that would help to confirm whether it is the correct diagnosis, excluding those whose answer is stated in the clinical history. List the next diagnostic tests that a physician should perform to confirm each disease or to rule them out if absent, prioritizing tests based on cost-effectiveness and patient convenience. Provide the ICD-10 codes and any other relevant coding for reimbursement purposes associated with each disease listed. Provide the standard of care for each disease. ",
"Objective: Employ the below-described algorithm to generate a prioritized differential diagnosis, considering the presence and absence of clinical findings.\n\nInput Data:\nYou will be provided with a clinical case description containing the following elements:\n- Initial Symptoms: A list of symptoms reported by the patient (e.g., \"fever,\" \"cough,\" \"abdominal pain\").\n- Positive Findings: A list of signs identified on physical examination or investigations (e.g., \"rales in lung bases,\" \"elevated white blood cell count\").\n- Negative Findings: A list of significant absent findings (e.g., \"no skin rash,\" \"no lymphadenopathy\").\n\nInstructions:\n- For each initial symptom and positive finding, consider all relevant diagnoses associated to that symptom or finding, creating a list of potential diagnoses.\n- For each potential diagnosis (e.g., diagnosis A), start with an initial score of 0, and calculate its final value using the following criteria:\n-- First, for all symptoms and positive findings (datum X) found in the clinical case description, add 1 to the existing score if X is highly supporting of diagnosis A, add 0.5 if X is moderately supportive, or add 0 if X is neutral. You must determine how supportive datum X is of diagnosis A based on your knowledge. This may involve using a knowledge base that links clinical data to diagnoses.\n-- Secondly, for all negative findings (datum Y) in the clinical case, multiply the existing score by 0.1 if datum Y is highly contradictive of diagnosis A, multiply by 0.5 if Y is moderately contradictive, or multiply by 1 if Y is neutral. This may involve using a knowledge base that links clinical data to diagnoses.\n-- Do not round the final score.\n- For each potential diagnosis, list potentially related diseases (3 at most)\n- For each potential diagnosis, list relevant tests that could be done to confirm the diagnosis (3 at most)\n- For each potential diagnosis, list proper treatments that should be carried out to provide care for the diagnosis (3 at most)\n- Please try and provide at least 5 different diagnoses, if possible\n- If a study does not show a quantifiable result or finding, assume that there is no finding related to that study.\n- Do not include a diagnosis in the differential diagnosis list when there are no positive findings or initial symptoms that support it.\n\nExample Input:\n    Initial Symptoms: \"Symptom A\", \"Symptom B\"\n    Positive Findings: \"Finding C\"\n    Negative Findings: \"No symptom D\", \"No finding E\"\nImportant Considerations:\n    Your medical knowledge and reasoning abilities are essential.\n    Pay careful attention to the significance of both present and absent findings.\n    Use a simplified scoring approach while the implementation is not available\n"
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
    butt00.addEventListener("click", async function(e)   {
/*
        var div00 = document.getElementById("div00");
        div00.style.display = "block";
        var butt00_form = document.getElementById("formIndex");
        var form_data = "";
        form_data += "<textarea name='seid00' hidden>" + document.getElementById("seid00").value + "</textarea>";
        form_data += "<textarea name='seid01' hidden>" + document.getElementById("seid01").value + "</textarea>";
        form_data += "<textarea name='model' hidden>" + encodeURIComponent(document.getElementById("seid00").selectedOptions[0].innerHTML) + "</textarea>";
        form_data += "<textarea name='prompt' hidden>" + encodeURIComponent(document.getElementById("texa00").value + " ") + "</textarea>";
        var up_case = document.getElementById("texa01").value;
        form_data += "<textarea name='case' hidden>" + encodeURIComponent(up_case + " ") + "</textarea>";
        butt00_form.innerHTML = form_data;
        butt00_form.submit();
*/

        //console.log(this);
        const texa02 = document.getElementById("texa02");
        this.disabled = true;
        texa02.value = "";
        const response = await fetch("/v3/diagnose", {
            method: "POST",
            headers: {  "Content-type": "application/json",
            },
            body: JSON.stringify({ 'seid00': document.getElementById("seid00").value,
                'seid01': document.getElementById("seid01").value,
                'model': encodeURIComponent(document.getElementById("seid00").selectedOptions[0].innerHTML),
                'prompt': encodeURIComponent(document.getElementById("texa00").value + " "),
                'case': encodeURIComponent(document.getElementById("texa01").value + " ")
            }),
        });
        const reader = response.body.getReader();
        let output = "";
        while(true) {
            const {done, value} = await reader.read();
            output += new TextDecoder().decode(value);
            texa02.value = output;
            if(done)    {
                document.getElementById("butt00").disabled = false;
                return;
            }
        }

/*
        .then(function (response) {
console.log("aa");
            return response.json();
        })
        .then(function (response) {
            document.getElementById("butt00").disabled = false;
console.log(response);
        })
        .catch(error => {
            document.getElementById("butt00").disabled = false;
            console.log("/v3/diagnose error: " + error);
        });
*/

    });

}

function change_prompts()  {
    var texa00 = document.getElementById("texa00");
    var cur_seid01 = document.getElementById("seid01").value;
    texa00.value = PROMPT_TEXT[cur_seid01];
}
