export default {
    root: ({ props }) => ({
        class: [{ 'opacity-60 select-none pointer-events-none cursor-default': props.disabled }]
    }),
    button: ({ context, props }) => ({
        class: [
            'relative',
            // Font
            'leading-none',

            // Flex Alignment
            'inline-flex items-center align-bottom text-center',

            // Spacing
            'px-4 py-3',

            // Shape
            'border border-r-0',
            'first:rounded-l-md first:rounded-tr-none first:rounded-br-none',
            'last:border-r last:rounded-tl-none last:rounded-bl-none last:rounded-r-md',

            // Color
            {
                'bg-surface-0 dark:bg-surface-900': !context.visible,
                'text-surface-700 dark:text-white/80': !context.visible,
                'border-surface-200 dark:border-surface-700': !context.visible && !props.invalid,
                'bg-primary border-primary text-primary-inverse': context.visible
            },
            // Invalid State
            { 'border-red-500 dark:border-red-400': props.invalid },

            // States
            'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 dark:focus:ring-primary-300/50 focus:z-10',
            {
                'hover:bg-surface-50 dark:hover:bg-surface-800/80': !context.visible && !props.invalid,
                'hover:bg-primary-hover': context.visible
            },
            { 'opacity-60 select-none pointer-events-none cursor-default': context.disabled },
            // Transition
            'transition duration-200',

            // Misc
            'cursor-pointer select-none overflow-hidden'
        ]
    }),
    label: {
        class: 'font-bold'
    }
};
