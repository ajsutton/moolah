import Vue from 'vue';
import Welcome from '@/components/welcome/Welcome';

describe('Hello.vue', () => {
  beforeEach(function () {
    const container = document.createElement('div');
    container.id = 'test-container';
    container.appendChild(document.createElement('div'));
    document.body.appendChild(container);
  });

  afterEach(function () {
    const container = document.getElementById('test-container');
    document.body.removeChild(container);
  });

  it('should render correct contents', () => {
    const Constructor = Vue.extend(Welcome);
    const vm = new Constructor().$mount('#test-container div');
    expect(vm.$el.querySelector('#test-container h1').textContent).to.equal('Moolah');
  });
});
