from flask import Flask, render_template, request
from urllib.parse import quote, unquote
from fn_gemini import queryGemini, parse_response

port = 5000

app = Flask(__name__)

@app.route("/")
def home():
  return render_template("/index.html")

@app.route("/v3/formIndex", methods = ["POST"])
def v3_formSymptoms():
    form_data = request.form
    seid00 = form_data.get('seid00')
    seid01 = form_data.get('seid01')
    model = form_data.get('model')
    prompt = unquote(form_data.get('prompt'))
    _case = unquote(form_data.get('case'))
    print(f"\n{prompt + _case = }")

    gemini_response = queryGemini(model, _case, prompt)

    up_info = [seid00, seid01, prompt.strip(), _case.strip(), parse_response(gemini_response)]
    res_data = parse_response(gemini_response)
    print()
    return render_template('/index.html', up_info = quote(str(up_info)), res_data = quote(str(res_data)))

if __name__ == "__main__":
    app.run(host = "0.0.0.0", port = port, debug = False)
