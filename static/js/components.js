Vue.component("card", {
  template: ` <div class="card">
                <header class="card-header">
                  <p class="card-header-title">
                    {{ title }}
                  </p>
                  <a v-if="icon" class="card-header-icon" :class="iconClass">
                    <span class="icon">
                      <i class="fas" :class="icon"></i>
                    </span>
                  </a>
                </header>
                <div class="card-content" :class="{'is-paddingless': paddingless}">
                  <div class="content">
                    <slot></slot>
                  </div>
                </div>
                <footer class="card-footer">
                  <slot name="footer"></slot>
                </footer>
              </div>`,
    props: {
      title: String,
      icon: String,
      iconClass: String,
      paddingless: Boolean
    }
});
