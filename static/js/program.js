Vue.component("code-editor", {
  template: ` <div>

                <section class="section">
                  <card :paddingless="true" title="Code Editor">

                    <div id="editor" style="width: 100%; height: 200px;"> </div>

                    <template v-slot:footer>
                      <b-loading :is-full-page="false" :active.sync="uploading"></b-loading>
                      <a @click="upload" class="card-footer-item">Upload to Board</a>
                      <a class="card-footer-item has-text-danger">Delete</a>
                    </template>
                  </card>
                </section>

                <section class="section">
                  <div class="columns" v-for="n in Math.ceil(callableKeys.length / 4)">
                    <div
                      class="column is-3"
                      v-for="functionName in callableKeys.slice((n-1) * 4, (n-1) * 4 + 4)"
                    >
                      <function-test
                        :key="functionName"
                        :function-name="functionName"
                        :args="device.callables[functionName]"
                        :device-id="device.id"
                      />
                    </div>
                  </div>
                </section>
              </div>`,
  data() {
    return {
      editor: null,
      uploading: false,
    };
  },
  props: {
    device: Object
  },
  mounted() {
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/textmate");
    this.editor.session.setMode("ace/mode/python");
    this.editor.setFontSize("14px");
    this.editor.setValue(this.device.code);
  },
  computed: {
    callableKeys() {
      return Object.keys(this.device.callables);
    }
  },
  methods: {
    upload() {
      this.uploading = true;
      this.$buefy.toast.open('Uploading to ' + this.device.id);
      axios.post(`/device/${this.device.id}/upload`, this.editor.getValue()).then( (response) => {
        this.uploading = false;
        if (response.data) {
          this.$buefy.toast.open({
            message: 'Uploaded to ' + this.device.id,
            type: 'is-success'
          });
          this.connectionLoading = false;
        } else {
          this.$buefy.toast.open({
            message: 'Failed to upload to ' + this.device.id,
            type: 'is-danger'
          });
          this.connectionLoading = false;
        }
      });
    }
  }
});

Vue.component("function-test", {
  template: ` <card :title="functionName">
                <parameter-input
                  v-for="arg in args"
                  :name="arg"
                  @input="updateArgValue(arg, $event)"
                  @changetype="updateArgType(arg, $event)"
                />
                <div class="box is-italic">
                  <div v-if="result && !nullResult">
                    Result: {{ result }}
                  </div>
                  <div v-if="!result && !nullResult">
                    Press 'Run' to see result here
                  </div>
                  <div v-if="nullResult">
                    Result: None
                  </div>
                </div>
                <template v-slot:footer>
                  <a @click="run" class="card-footer-item">Run</a>
                </template>
              </card>`,
  props: {
    functionName: String,
    args: Array,
    deviceId: String,
  },
  data() {
    return {
      argValues: {},
      result: null,
      nullResult: false,
    }
  },
  mounted() {
    for (arg of this.args) {
      this.argValues[arg] = {value: null, type: "String"};
    }
  },
  methods: {
    updateArgType(arg, type) {
      this.argValues[arg]['type'] = type;
      this.argValues[arg]['value'] = null;
    },
    updateArgValue(arg, value) {
      this.argValues[arg]['value'] = value;
    },
    run() {
      axios.post(`/device/${this.deviceId}/call/${this.functionName}`, this.argValues).then( (response) => {
        this.result = response.data;
        if (this.result == null) {
          this.nullResult = true;
        }
      });
    }
  }
});

Vue.component("parameter-input", {
  template: ` <b-field :label="name" label-position="on-border">
                <b-input v-if="showInputType == 'input'" @input="$emit('input', $event)"></b-input>
                <b-checkbox v-if="showInputType == 'check'" @input="$emit('input', $event)"></b-checkbox>
                <b-numberinput v-if="showInputType == 'numeric'" @input="$emit('input', $event)"></b-numberinput>
                <p class="control">
                  <b-select v-model="type" @input="$emit('changetype', type)" placeholder="Select a name">
                    <option>String</option>
                    <option>Integer</option>
                    <option>Boolean</option>
                  </b-select>
                </p>
              </b-field>`,
  props: {
    name: String,
  },
  data(){
    return {
      type: "String"
    };
  },
  computed: {
    showInputType() {
      if (this.type == "String") {
        return "input";
      }
      if (this.type == "Boolean") {
        return "check";
      }
      if (this.type == "Integer") {
        return "numeric";
      }
    }
  },
});

Vue.component("file-tree", {
  template: ` <nav class="panel">
                <p class="panel-heading">
                  Device Filetree
                </p>
                <div class="panel-block">
                  <p class="control has-icons-left">
                    <input class="input" type="text" placeholder="Search">
                    <span class="icon is-left">
                      <i class="fas fa-search" aria-hidden="true"></i>
                    </span>
                  </p>
                </div>
                <a class="panel-block is-active">
                  <span class="panel-icon">
                    <i class="fas fa-book" aria-hidden="true"></i>
                  </span>
                  user.py
                </a>
              </nav>`,
  data() {
    return {
      upoading: false,
    };
  },
  props: {
    device: Object
  },
  mounted() {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/textmate");
    editor.session.setMode("ace/mode/python");
    editor.setFontSize("14px");
    editor.setValue(this.device.code);
  }
});
