Vue.component("add-device-form", {
  template: ` <card title="Add Device">

                <b-steps v-model="step" :has-navigation="false" :animated="true">
                  <b-step-item label="Name Device" icon-pack="fas" icon="font"></b-step-item>
                  <b-step-item label="Connect Device" icon-pack="fas" icon="plug"></b-step-item>
                  <b-step-item label="Initialise Device" icon-pack="fas" icon="sync"></b-step-item>
                </b-steps>

                <step-one
                  v-if="step == 0"
                  @steponecomplete="stepOneComplete($event)"
                />

                <step-two
                  v-if="step == 1"
                  @steptwocomplete="stepTwoComplete($event)"
                />

                <step-three
                  v-if="step == 2"
                  @stepthreecomplete="stepThreeComplete($event)"
                  :id="deviceId"
                  :port="portName"
                />

              </card>`,
  data() {
    return {
      step: 0,
      deviceId: "",
      portName: "",
    };
  },
  methods: {
    stepOneComplete(ev) {
      this.deviceId = ev;
      this.step ++;
    },
    stepTwoComplete(ev) {
      this.portName = ev;
      this.step ++;
    }
  }
});

Vue.component("step-one", {
  template: ` <div>
                <b-field label="Device ID">
                  <b-input v-model="deviceId"></b-input>
                </b-field>
                <b-button @click="$emit('steponecomplete', deviceId)">Next</b-button>
              </div>`,
  data() {
    return {
      deviceId: "",
    };
  }
});

Vue.component("step-two", {
  template: ` <div>
                <div v-show="step == 0">
                  Ensure your device is not plugged into the Raspberry Pi
                  <b-button :loading="loading" @click="stepZeroComplete">Next</b-button>
                </div>
                <div v-show="step == 1">
                  Now plug your device into the Raspberry Pi
                  <b-button :loading="loading" @click="stepOneComplete">Next</b-button>
                </div>
                <div v-show="step == 2">
                  Connecting
                </div>
              </div>`,
  data() {
    return {
      allPorts: [],
      portName: "",
      step: 0,
      loading: false
    };
  },
  methods: {
    stepZeroComplete() {
      this.loading = true;
      axios.get('/add-device/ports').then( (response) => {
        this.allPorts = response.data;
        this.loading = false;
        this.step ++;
      });
    },
    stepOneComplete() {
      this.loading = true;
      axios.get('/add-device/ports').then( (response) => {
        var newPorts = response.data.filter(x => !this.allPorts.includes(x));
        if (newPorts.length == 1) {
          this.portName = newPorts[0];
          this.loading = false;
          this.$emit('steptwocomplete', this.portName);
        } else {
          this.$buefy.toast.open({
            message: 'Failed to connect. Please try again',
            type: 'is-danger'
          });
          this.loading = false;
          this.step = 0;
        }
      });
    }
  }
});

Vue.component("step-three", {
  template: ` <div>
                <b-button v-if="!init" :loading="loading" @click="initialise">Initialise {{ id }}</b-button>
                <div v-if="init">
                  Initialisation complete!
                  <b-button @click="program">Home</b-button>
                  <b-button @click="home">Program {{ id }}</b-button>
                </div>
              </div>`,
  props: {
    id: String,
    port: String,
  },
  data() {
    return {
      loading: false,
      init: false,
    }
  },
  methods: {
    initialise() {
      this.loading = true;
      axios.post('/add-device/init', {id: this.id, port: this.port}).then( (response) => {
        this.loading = false;
        if (response.data.result) {
          this.$buefy.toast.open({
            message: "Device succesfully added",
            type: 'is-success'
          });
          this.init = true;
        } else {
          this.$buefy.toast.open({
            message: response.data.error,
            type: 'is-danger'
          });
        }
      });
    },
    program() {
      window.location.href = `/device/${this.id}/program`;
    },
    home() {
      window.location.href = `/`;
    },
  }
});
