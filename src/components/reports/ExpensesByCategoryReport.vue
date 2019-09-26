<template>
  <v-card>
    <v-app-bar flat class="white">
      <v-toolbar-title class="body-2 grey--text">Expenses by Category</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-select label="History" :items="historyItems" v-model="previousMonths"></v-select>
      </v-toolbar-items>
    </v-app-bar>
    <v-simple-table
      
    >
      <tbody>
        <template v-for="item in reportData">
          <tr class="v-row-group__header">
            <td class="font-weight-bold">{{item.name}}</td>
            <td class="text-bold text-right"><monetary-amount :value="item.totalExpenses"></monetary-amount></td>
          </tr>
          <tr v-for="child in item.children">
            <td>{{ child.name }}</td>
            <td class="text-right"><monetary-amount :value="child.totalExpenses"></monetary-amount></td>
          </tr>
        </template>
      </tbody>
      <!-- <template v-slot:group.header="{ items }">
        <td class="font-weight-bold">{{ items[0].rootName }}</td>
        <td class="text-right font-weight-bold"><monetary-amount :value="items.map(item => item.totalExpenses).reduce((a, b) => a + b)"></monetary-amount></td>
      </template>
      <template v-slot:item.category="{ item }">{{ getCategoryName(item.categoryId) }}</template>
      <template v-slot:item.expenditure="{ item }">
        <monetary-amount :value="item.totalExpenses"></monetary-amount>
      </template> -->
    </v-simple-table>
  </v-card>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from "vuex";
import client from "../../api/client";
import store from "../../store/store";
import { formatDate } from "../../api/apiFormats";
import addMonths from "date-fns/addMonths";
import MonetaryAmount from "../util/MonetaryAmount.vue";
import { expenseByCategoryReportData } from "./expenseByCategoryReportData";

export default {
  data() {
    return {
      expenseBreakdown: [],
      previousMonths: 6,
      headers: [
        {
          text: "Category",
          value: "category"
        },
        {
          text: "Expenditure",
          value: "expenditure",
          align: "right",
          divider: true
        }
      ],
      historyItems: [
        { text: "1 Month", value: 1 },
        { text: "3 Months", value: 3 },
        { text: "6 Months", value: 6 },
        { text: "9 Months", value: 9 },
        { text: "1 Year", value: 12 },
        { text: "2 Years", value: 24 },
        { text: "3 Years", value: 36 },
        { text: "4 Years", value: 48 },
        { text: "5 Years", value: 60 },
        { text: "All", value: "All" }
      ]
    };
  },
  computed: {
    afterDate() {
      return this.previousMonths !== "All"
        ? formatDate(addMonths(new Date(), -this.previousMonths))
        : undefined;
    },
    reportData() {
      return expenseByCategoryReportData(
        this.expenseBreakdown,
        this.categoriesById,
        this.getCategoryName
      );
    },
    ...mapGetters("categories", ["getCategoryName"]),
    ...mapState("categories", ["categoriesById"])
  },
  watch: {
    previousMonths() {
      this.update();
    }
  },
  methods: {
    async update() {
      this.expenseBreakdown = await client.expenseBreakdown(
        new Date().getDate(),
        this.afterDate
      );
    }
  },
  async mounted() {
    this.update();
  },
  components: {
    MonetaryAmount
  }
};
</script>