<script setup>
import { ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

const users = ref(null);
const getUsers = async () => {
  const response = await fetch("http://localhost:3000/users");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  users.value = data;
};
</script>

<template>
  <HelloWorld />
  <button @click="getUsers">Get users</button>
  <div v-if="users !== null">
    <div v-for="{ id, first_name, last_name, location } in users" :key="id">
      <span class="col">
        {{ first_name }}
      </span>
      <span class="col">
        {{ last_name }}
      </span>
      <span class="col">
        {{ location }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.col:not(:last-child) {
  margin-right: 10px;
  border-right: 1px solid black;
  padding-right: 10px;
}
</style>
