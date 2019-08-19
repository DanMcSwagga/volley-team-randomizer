<template>
  <div class="app">
    <!-- <div id="nav"><router-link to="/">Home</router-link></div> -->
    <router-view />
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Montserrat:300,400,700,900&display=swap&subset=cyrillic');

.app {
  font-family: 'Montserrat', sans-serif;
  text-align: center;
  // margin: 0 5%;
}

button {
  line-height: 24px;
  padding: 12px 24px;
  margin: 12px 24px;
  font-size: 16px;
  text-transform: uppercase;
  font-weight: 600;
  border: 0px;
  background-color: rgba(59, 153, 252, 0.6);
  // background-color: #999999;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: rgba(59, 153, 252, 0.8);
    // border-color: transparent;
    color: white;
  }
  &:active {
    background-color: rgba(59, 153, 252, 1);
    // border-color: transparent;
    color: white;
  }
  &:focus {
    outline: none;
  }
}
</style>
