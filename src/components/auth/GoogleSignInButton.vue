<template>
    <a href="/api/googleauth" class="google-signin-btn" :class="theme">
        <svg
            class="google-icon"
            width="18"
            height="18"
            viewBox="0 0 48 48"
        >
            <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
        </svg>
        <span class="google-text">Sign in with Google</span>
    </a>
</template>

<script>
export default {
    name: 'GoogleSignInButton',
    props: {
        theme: {
            type: String,
            default: 'light',
            validator: (v) => ['light', 'dark'].includes(v),
        },
    },
};
</script>

<style lang="scss" scoped>
.google-signin-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 44px;
    border-radius: 22px;
    font-family: 'Roboto', 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.25px;
    text-decoration: none;
    cursor: pointer;
    transition:
        box-shadow 0.2s,
        background 0.2s;

    &.light {
        background: #ffffff;
        color: #1f1f1f;
        border: 1px solid #747775;

        &:hover {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            background: #f2f2f2;
        }
    }

    &.dark {
        background: #131314;
        color: #e3e3e3;
        border: 1px solid #8e918f;

        &:hover {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
            background: #1f1f1f;
        }
    }
}

.google-icon {
    flex-shrink: 0;
}

.google-text {
    white-space: nowrap;
}
</style>
