// components/tab-bar/index.js
Component({
  data: {
    selected: 0,
    list: [
      {
        icon: 'home',
        selectedIcon: 'home-fill',
        text: '首页'
      },
      {
        icon: 'radio',
        selectedIcon: 'radio-fill',
        text: '频道'
      },
      {
        icon: 'time',
        selectedIcon: 'time-fill',
        text: '胶囊'
      },
      {
        icon: 'user',
        selectedIcon: 'user-fill',
        text: '我的'
      }
    ]
  },

  attached() {
    this.updateSelected();
  },

  methods: {
    updateSelected() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const route = currentPage.route;

      let selected = 0;
      if (route.includes('home')) selected = 0;
      else if (route.includes('channel')) selected = 1;
      else if (route.includes('capsule')) selected = 2;
      else if (route.includes('mine')) selected = 3;

      this.setData({ selected });
    },

    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const url = this.data.list[index].path || `/pages/${['home', 'channel', 'capsule', 'mine'][index]}/index`;

      wx.switchTab({ url });
    }
  }
})
