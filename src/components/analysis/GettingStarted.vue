<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Welcome!</v-card-title>
                    <v-card-text>
                        <p>
                            To get started tracking your moolah, we need to do a
                            little setup work. Don't worry, it won't take long.
                        </p>
                        <div class="text-h6">Accounts</div>
                        <p>
                            Accounts are the basic container of money (or debt)
                            in Moolah. Things like your bank accounts, credit
                            cards and loans should be created as accounts in
                            Moolah.
                        </p>
                        <p class="font-weight-bold">
                            Create an account using the
                            <v-icon>mdi-plus</v-icon> button beside
                            <i>Accounts</i> in the left sidebar.
                        </p>
                        <p>
                            The balance of each account in Moolah should be the
                            same as the balance of the real account it tracks.
                            If not, you've likely missed recording a
                            transaction.
                        </p>

                        <p>
                            If you don't plan to add existing transactions, you
                            can set the opening balance for each account to the
                            real account's current balance, then just record new
                            transactions going forward.
                        </p>

                        <div class="text-h6">Transactions</div>
                        <p>
                            Once you have at least one account created, you can
                            start tracking transactions for each payment into or
                            out of an account. Transactions can be recorded as
                            income, expenses or transfers between your accounts.
                        </p>

                        <p class="font-weight-bold">
                            Create transactions from within an account view with
                            the <v-icon>mdi-plus</v-icon> button at the top
                            right.
                        </p>

                        <div class="text-h6">Categories</div>
                        <p>
                            To allow you to understand where you're money is
                            coming from and what it's being spent on, you can
                            assign a category to each transaction.
                        </p>
                        <p>
                            Before you can do that though, you need to create
                            some categories.
                        </p>
                        <p class="font-weight-bold">
                            Create categories from the <i>Categories</i> panel.
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            currentStep: 1,
        };
    },
    computed: {
        hasAccounts() {
            return true;
        },
        hasCategories() {
            return false;
        },
        hasTransactions() {
            return false;
        },
    },
};
</script>
