from flask import Flask, request, render_template

import json

import OneIoT

app = Flask(__name__)

deviceManager = OneIoT.DeviceManager()

@app.route('/')
def index():
    devices = deviceManager.get_devices().keys()
    return render_template("index.html", deviceIds=json.dumps(list(devices)))

@app.route('/device/<device_id>')
def get_device(device_id):
    device = deviceManager.get_device(device_id)
    device_dict = {
        'id': device.id,
        'connected': device.connected,
        'code': device.code,
        'callables': device.callables,
    }
    return json.dumps(device_dict)

@app.route('/device/<device_id>/connect')
def connect(device_id):
    try:
        deviceManager.get_device(device_id).connect()
        return json.dumps(True)
    except:
        return json.dumps(False)

@app.route('/device/<device_id>/disconnect')
def disconnect(device_id):
    try:
        deviceManager.get_device(device_id).disconnect()
        return json.dumps(True)
    except:
        return json.dumps(False)

@app.route('/device/<device_id>/program')
def program(device_id):
    return render_template("program.html")

@app.route('/device/<device_id>/upload', methods=['POST'])
def upload(device_id):
    try:
        device = deviceManager.get_device(device_id)
        code = request.get_data().decode("utf-8")
        device.uploadString(code, "user.py")
        return json.dumps(True)
    except:
        return json.dumps(False)

@app.route('/device/<device_id>/call/<function>', methods=['POST'])
def call(device_id, function):
    #try:
    device = deviceManager.get_device(device_id)
    args = json.loads(request.get_data().decode("utf-8"))
    args = [args[x] for x in args]
    result = getattr(device, function).__call__(args)
    return json.dumps(True)
    #except:
    #    return json.dumps(False)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
