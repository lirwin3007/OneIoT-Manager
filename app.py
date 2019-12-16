from flask import Flask, request, render_template

import json
import serial.tools.list_ports

import oneiot

app = Flask(__name__)

deviceManager = oneiot.DeviceManager()

def get_device_data():
    result = json.load(open('devices.json'))
    return result

@app.route('/')
def index():
    devices = deviceManager.get_devices().keys()
    device_data = get_device_data()
    return render_template("index.html", deviceIds=json.dumps(list(devices)), device_data=device_data)

@app.route('/add-device')
def add_device():
    return render_template("add_device.html")

@app.route('/add-device/ports')
def add_device_ports():
    return json.dumps([x.name for x in serial.tools.list_ports.comports()])

@app.route('/add-device/init', methods=['POST'])
def add_device_init():
    try:
        deviceManager.add_device(request.json['id'], request.json['port'])
        deviceManager.init_device(request.json['id'], request.json['port'])
        return json.dumps({'result': True})
    except Exception as e:
        return json.dumps({'result': False, 'error': str(e)})

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
        return json.dumps({'result': True})
    except Exception as e:
        return json.dumps({'result': False, 'error':str(e)})

@app.route('/device/<device_id>/disconnect')
def disconnect(device_id):
    try:
        deviceManager.get_device(device_id).disconnect()
        return json.dumps(True)
    except:
        return json.dumps(False)

@app.route('/device/<device_id>/remove')
def remove(device_id):
    try:
        deviceManager.remove_device(device_id)
        return json.dumps({'result': True})
    except Exception as e:
        return json.dumps({'result': False, 'error':str(e)})

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
    try:
        device = deviceManager.get_device(device_id)
        args = json.loads(request.get_data().decode("utf-8"))
        args = [args[x]['value'] for x in args]
        result = getattr(device, function).__call__(*args)
        return json.dumps(result)
    except:
        return json.dumps(False)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
