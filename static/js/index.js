Vue.component("devices", {
  template: ` <div>
                <div style="width:100%" class="tile is-ancestor" v-for="n in Math.ceil(deviceIds.length / 4)">
                  <div
                    class="tile is-parent is-3"
                    v-for="deviceId in deviceIds.slice((n-1) * 4, (n-1) * 4 + 4)"
                  >
                    <deviceCard
                      class="tile is-child"
                      key="deviceId"
                      :device-id="deviceId"
                      :device-buttons="deviceData[deviceId].buttons"
                    />
                  </div>
                </div>
              </div>`,
  props: {
    deviceIds: Array,
    deviceData: Object,
  }
});

Vue.component("deviceCard", {
  template: ` <card v-if="device" :title="deviceId" icon="fa-plug" :icon-class="iconClass">
                <div class="container" v-for="buttonData in deviceButtons">
                  <device-button
                    :button-data="buttonData"
                    :device-id="deviceId"
                  />
                </div>
                <template v-slot:footer>
                  <b-loading :is-full-page="false" :active.sync="connectionLoading"></b-loading>
                  <a @click="connect" v-if="!device.connected" class="card-footer-item">Connect</a>
                  <a @click="disconnect" v-if="device.connected" class="card-footer-item">Disconnect</a>
                  <a @click="program" class="card-footer-item">Program</a>
                  <a class="card-footer-item has-text-danger">Delete</a>
                </template>
              </card>`,
  data() {
    return {
      device: {},
      connectionLoading: false,
    };
  },
  props: {
    deviceId: String,
    deviceButtons: Array,
  },
  mounted() {
    this.getDevice();
  },
  computed: {
    iconClass() {
      return this.device.connected ? "has-text-success" : "has-text-danger";
    },
  },
  methods: {
    getDevice() {
      axios.get(`/device/${this.deviceId}`).then( (response) => {
        this.device = response.data;
      });
    },
    program() {
      window.location.href = `/device/${this.device.id}/program`;
    },
    connect() {
      this.connectionLoading = true;
      this.$buefy.toast.open('Connecting to ' + this.device.id);
      axios.get(`/device/${this.device.id}/connect`).then( (response) => {
        if (response.data) {
          this.getDevice();
          this.$buefy.toast.open({
            message: 'Connected to ' + this.device.id,
            type: 'is-success'
          });
          this.connectionLoading = false;
        } else {
          this.$buefy.toast.open({
            message: 'Failed to connect to ' + this.device.id,
            type: 'is-danger'
          });
          this.connectionLoading = false;
        }
      });
    },
    disconnect() {
      this.connectionLoading = true;
      this.$buefy.toast.open('Disconnecting from ' + this.device.id);
      axios.get(`/device/${this.device.id}/disconnect`).then( (response) => {
        if (response.data) {
          this.getDevice();
          this.$buefy.toast.open({
            message: 'Disconnected from ' + this.device.id,
            type: 'is-success'
          });
          this.connectionLoading = false;
        } else {
          this.$buefy.toast.open({
            message: 'Failed to disconnect to ' + this.device.id,
            type: 'is-danger'
          });
          this.connectionLoading = false;
        }
      });
    }
  }
});

Vue.component("device-button", {
  template: ` <b-button @click="onClick">
                {{ buttonData.display }}
              </b-button>`,
  props: {
    deviceId: String,
    buttonData: Object,
  },
  methods: {
    onClick() {
      axios.post(`/device/${this.deviceId}/call/${this.buttonData.function}`, this.buttonData.args).then( (response) => {
        this.$buefy.toast.open({
          message: '"' + this.buttonData.display + '" ran succesfully',
          type: 'is-success'
        });
      });
    }
  }
});
