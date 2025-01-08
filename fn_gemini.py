import os
import json
import google.generativeai as genai
import typing_extensions as te
from dotenv import load_dotenv
load_dotenv()

class singDiag(te.TypedDict):
    diagnosis: str
    diagnosis_score: float
    highly_supportive_symptoms_and_positive_findings: list[str]
    moderately_supportive_symptoms_and_positive_findings: list[str]
    neutral_symptoms_and_positive_findings: list[str]
    highly_contradictive_negative_findings: list[str]
    moderately_contradictive_negative_findings: list[str]
    neutral_negative_findings: list[str]
    potentially_related_diseases: list[str]
    relevant_confirmatory_tests: list[str]
    icd10: str
    treatments_to_care_for_diagnosis: list[str]
    explanation_for_diagnosis: str

def get_score(jdata):
    try:
        return float(jdata['diagnosis_score'])
    except Exception as e:
        print(f'*** get_score error:\nerror: {e}')
        return 0

def generate_gem(_model, prompt, instructions):
    #response = ['[', '\n  {\n    "diagnosis": "Polycystic Ovary Syndrome', ' (PCOS)",\n    "diagnosis_score": 1.5,', '\n    "explanation_for_diagnosis": "Oligomenorrhea is a common symptom of PCOS due to hormonal imbalances affecting ovulation.",\n    "highly_', 'contradictive_negative_findings": [],\n    "highly_supportive_symptoms_and_positive_findings": ["oligomenorrhea"],\n    ', '"icd10": "E28.2",\n    "moderately_contradictive_negative_findings": [],\n    "moderately_supportive_symptoms_and_positive_findings": [],\n    ', '"neutral_negative_findings": [],\n    "neutral_symptoms_and_positive_findings": [],\n    "potentially_related_diseases": ["Hyperandrogenism", "Insulin Resistance", "Infertility', '"],\n    "relevant_confirmatory_tests": ["Pelvic Ultrasound", "Hormone Level Tests (LH, FSH, Testosterone)", "Glucose Tolerance Test"],\n    "treatments_to_care_for_diagnosis": ["Lifestyle Modifications (diet, exercise)", "Oral Contraceptives", "', 'Metformin"]\n  },\n  {\n    "diagnosis": "Hypothalamic Amenorrhea",\n    "diagnosis_score": 1.0,\n    "explanation_for_diagnosis": "Oligomenorrhea can result from hypothalamic dysfunction, often due to stress, excessive exercise, or low', ' body weight.",\n    "highly_contradictive_negative_findings": [],\n    "highly_supportive_symptoms_and_positive_findings": ["oligomenorrhea"],\n    "icd10": "N91.0",\n    "moderately_contradictive_negative_', 'findings": [],\n    "moderately_supportive_symptoms_and_positive_findings": [],\n    "neutral_negative_findings": [],\n    "neutral_symptoms_and_positive_findings": [],\n    "potentially_related_diseases": ["Eating Disorders", "Stress-', 'Related Amenorrhea", "Functional Hypothalamic Amenorrhea"],\n    "relevant_confirmatory_tests": ["Hormone Level Tests (LH, FSH, Estradiol)", "Thyroid Function Tests", "Assessment of Stress Levels"],\n    "treatments_to_care_for_diagnosis', '": ["Stress Management", "Nutritional Counseling", "Hormone Replacement Therapy"]\n  },\n  {\n    "diagnosis": "Thyroid Dysfunction",\n    "diagnosis_score": 0.5,\n    "explanation_for_diagnosis": "Both hypothyroidism and hyperthyroidism can cause menstrual', ' irregularities, including oligomenorrhea.",\n    "highly_contradictive_negative_findings": [],\n    "highly_supportive_symptoms_and_positive_findings": [],\n    "icd10": "E03.9",\n    "moderately_contradictive_negative_', 'findings": [],\n    "moderately_supportive_symptoms_and_positive_findings": ["oligomenorrhea"],\n    "neutral_negative_findings": [],\n    "neutral_symptoms_and_positive_findings": [],\n     "potentially_related_diseases": ["Hypothyroidism', '", "Hyperthyroidism", "Thyroiditis"],\n    "relevant_confirmatory_tests": ["Thyroid Function Tests (TSH, T4, T3)", "Thyroid Antibody Tests", "Thyroid Ultrasound"],\n    "treatments_to_care_for_diagnosis": ["Lev', 'othyroxine (for hypothyroidism)", "Antithyroid Medications (for hyperthyroidism)", "Radioactive Iodine Therapy"]\n  },\n  {\n    "diagnosis": "Primary Ovarian Insufficiency (POI)",\n    "diagnosis_score": 0.5,\n    "explanation_for_', 'diagnosis": "POI, or premature ovarian failure, can lead to irregular periods, including oligomenorrhea.",\n    "highly_contradictive_negative_findings": [],\n    "highly_supportive_symptoms_and_positive_findings": [],\n    "icd10": "E28', '.31",\n    "moderately_contradictive_negative_findings": [],\n    "moderately_supportive_symptoms_and_positive_findings": ["oligomenorrhea"],\n    "neutral_negative_findings": [],\n    "neutral_symptoms_and_positive_findings', '": [],\n    "potentially_related_diseases": ["Premature Menopause", "Ovarian Failure", "Infertility"],\n    "relevant_confirmatory_tests": ["Hormone Level Tests (FSH, Estradiol)", "Karyotype Analysis", "Anti-Mull', 'erian Hormone (AMH) Test"],\n    "treatments_to_care_for_diagnosis": ["Hormone Replacement Therapy", "Calcium and Vitamin D Supplementation", "Fertility Treatments"]\n  },\n   {\n    "diagnosis": "Pregnancy",\n    "diagnosis_score":', ' 0.1,\n    "explanation_for_diagnosis": "While typically associated with amenorrhea, early pregnancy can sometimes present with irregular bleeding or spotting, which might be perceived as oligomenorrhea.",\n    "highly_contradictive_negative_findings": [],\n    "highly_supportive_s', 'ymptoms_and_positive_findings": [],\n    "icd10": "Z32.1",\n    "moderately_contradictive_negative_findings": [],\n    "moderately_supportive_symptoms_and_positive_findings": [],\n    "neutral_negative_', 'findings": [],\n    "neutral_symptoms_and_positive_findings": ["oligomenorrhea"],\n    "potentially_related_diseases": ["Ectopic Pregnancy", "Threatened Abortion", "Normal Pregnancy"],\n    "relevant_confirmatory_tests": ["Urine Pregnancy Test",', ' "Serum Beta-hCG Test", "Pelvic Ultrasound"],\n    "treatments_to_care_for_diagnosis": ["Prenatal Care", "Folic Acid Supplementation", "Management of Pregnancy Complications"]\n  }\n]']

    genai.configure(api_key = os.getenv("GEMINI_API_KEY"))
    try:
        generation_config = {
          "temperature": 0,
          "top_p": 0.95,
          "top_k": 40,
          "max_output_tokens": 8192,
          #"response_mime_type": "text/plain",
          "response_mime_type": "application/json",
          "response_schema": list[singDiag],
        }

        model = genai.GenerativeModel(
          model_name=_model,
          generation_config=generation_config,
          system_instruction=instructions,
        )

        response = model.generate_content("Clinical case: " + prompt + "\nPlease reply using the same language as the clinical case.", stream = True)
    except Exception as e:
        print(f'*** Gemini error:\nerror: {e}')
        return ''

    full = ""
    pos = 0
    ppos = -1
    for part in response:
        #time.sleep(0.5)
        #print(f'--> yielding: {part}')
        #yield (part)
        full += part.text
        res, pos = partial_json(full, pos)
        if res is not None:
            ppos = pos
            #print(f'>> {res = }')
            #yield str(res)
            #print(f'>> {parse_response([res]) = }')
            yield parse_response([res])

def partial_json(text, pos = 0, decoder = json.JSONDecoder()):
    while True:
        match = text.find('{', pos)
        if match == -1:
            return None, pos
        try:
            result, index = decoder.raw_decode(text[match: ])
            return result, match + index
            pos = match + index
        except ValueError:
            return None, pos

def queryGemini(_model, prompt, instructions):
    genai.configure(api_key = os.getenv("GEMINI_API_KEY"))
    try:
        generation_config = {
          "temperature": 0,
          "top_p": 0.95,
          "top_k": 40,
          "max_output_tokens": 8192,
          #"response_mime_type": "text/plain",
          "response_mime_type": "application/json",
          "response_schema": list[singDiag],
        }

        model = genai.GenerativeModel(
          model_name=_model,
          generation_config=generation_config,
          system_instruction=instructions,
        )

        response = model.generate_content("Clincal case: " + prompt + "\nPlease reply using the same language as the clinical case.", stream = True)
    except Exception as e:
        print(f'*** Gemini error:\nerror: {e}')
        return ''

    # print(f"\n*** Asking Gemini:\n\n{prompt}\nResponse from Gemini:\n{response = }")
    resp_list = json.loads(response.text)
    resp_list.sort(reverse = True, key = get_score)
    return resp_list

def jkey(jdata, key):
    try:
        return jdata[key]
    except Exception as e:
        return ""

def parse_response(resp_list):
    n = 1
    tab = "\t"
    ret_text = ""
    for diag in resp_list:
        # UNSUBSTANTIATED DIAG
        if ("highly_supportive_symptoms_and_positive_findings" not in diag or len(diag["highly_supportive_symptoms_and_positive_findings"]) == 0) and ("moderately_supportive_symptoms_and_positive_findings" not in diag or len(diag["moderately_supportive_symptoms_and_positive_findings"]) == 0):
            ret_text += ">>> UNSUBSTANTIATED diagnosis <<<\n"
        # UNLIKELY DUE TO NEGATIVE SYMPTOMS
        if "highly_contradictive_negative_findings" in diag and len(diag["highly_contradictive_negative_findings"]) > 0:
            ret_text += ">>> UNLIKELY due to negative/absent symptoms <<<\n"
        else:
            # POSSIBLE BUT LOW PROBABILITY
            if "highly_supportive_symptoms_and_positive_findings" not in diag or len(diag["highly_supportive_symptoms_and_positive_findings"]) == 0:
                ret_text += ">>> MODERATE probability <<<\n"
        #ret_text += f'{str(n)}' + "- " + f'{jkey(diag, "diagnosis")}' + tab + "(" + f'{jkey(diag, "icd10")}' + ")" + tab + "[" + f'{jkey(diag, "diagnosis_score")}' + "]\n"
        ret_text += "- " + f'{jkey(diag, "diagnosis")}' + tab + "(" + f'{jkey(diag, "icd10")}' + ")" + tab + "[" + f'{jkey(diag, "diagnosis_score")}' + "]\n"
        ret_text += "* " + f'{jkey(diag, "explanation_for_diagnosis")}' + ""
        if "potentially_related_diseases" in diag and len(diag["potentially_related_diseases"]) > 0:
            ret_text += "\n* Related diseases:\n"
            for prd in diag["potentially_related_diseases"]:
                ret_text += tab + f'{prd}' + "\n"
        if "relevant_confirmatory_tests" in diag and len(diag["relevant_confirmatory_tests"]) > 0:
            ret_text += "* Confirmation tests:\n"
            for prd in diag["relevant_confirmatory_tests"]:
                ret_text += tab + f'{prd}' + "\n"
        if "treatments_to_care_for_diagnosis" in diag and len(diag["treatments_to_care_for_diagnosis"]) > 0:
            ret_text += "* Standard care:\n"
            for prd in diag["treatments_to_care_for_diagnosis"]:
                ret_text += tab + f'{prd}' + "\n"
        if ("highly_supportive_symptoms_and_positive_findings" in diag and len(diag["highly_supportive_symptoms_and_positive_findings"]) > 0) or ("moderately_supportive_symptoms_and_positive_findings" in diag and len(diag["moderately_supportive_symptoms_and_positive_findings"]) > 0) or ("neutral_symptoms_and_positive_findings" in diag and len(diag["neutral_symptoms_and_positive_findings"]) > 0):
            ret_text += "* Present symptoms:\n"
            nline = ""
            if "highly_supportive_symptoms_and_positive_findings" in diag and len(diag["highly_supportive_symptoms_and_positive_findings"]) > 0:
                ret_text += tab + "[HIGH]: "
                nline = "\n"
                for prd in diag["highly_supportive_symptoms_and_positive_findings"]:
                    ret_text += f'{prd}' + "; "
            ret_text += f'{nline}'
            nline = ""
            if "moderately_supportive_symptoms_and_positive_findings" in diag and len(diag["moderately_supportive_symptoms_and_positive_findings"]) > 0:
                ret_text += tab + "[MOD]: "
                nline = "\n"
                for prd in diag["moderately_supportive_symptoms_and_positive_findings"]:
                    ret_text += f'{prd}' + "; "
            ret_text += f'{nline}'
            nline = ""
            if "neutral_symptoms_and_positive_findings" in diag and len(diag["neutral_symptoms_and_positive_findings"]) > 0:
                ret_text += tab + "[NEUT]: "
                nline = "\n"
                for prd in diag["neutral_symptoms_and_positive_findings"]:
                    ret_text += f'{prd}' + "; "
            ret_text += f'{nline}'
        if ("highly_contradictive_negative_findings" in diag and len(diag["highly_contradictive_negative_findings"]) > 0) or ("moderately_contradictive_negative_findings" in diag and len(diag["moderately_contradictive_negative_findings"]) > 0) or ("neutral_negative_findings" in diag and len(diag["neutral_negative_findings"]) > 0):
            ret_text += "* Absent symptoms:\n"
            nline = ""
            if "highly_contradictive_negative_findings" in diag and len(diag["highly_contradictive_negative_findings"]) > 0:
                ret_text += tab + "[HIGH]: "
                nline = "\n"
                for prd in diag["highly_contradictive_negative_findings"]:
                    ret_text += f'{prd}' + "; "
            ret_text += f'{nline}'
            nline = ""
            if "moderately_contradictive_negative_findings" in diag and len(diag["moderately_contradictive_negative_findings"]) > 0:
                ret_text += tab + "[MOD]: "
                nline = "\n"
                for prd in diag["moderately_contradictive_negative_findings"]:
                    ret_text += f'{prd}' + "; "
            ret_text += f'{nline}'
            nline = ""
            if "neutral_negative_findings" in diag and len(diag["neutral_negative_findings"]) > 0:
                ret_text += tab + "[NEUT]: "
                nline = "\n"
                for prd in diag["neutral_negative_findings"]:
                    ret_text += f'{prd}' + "; "
            ret_text += f'{nline}'
        ret_text += "\n"
        n += 1
    return ret_text
    # return json.dumps(resp_list)
