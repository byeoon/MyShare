<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
</script>

<div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    transition:fade={{ duration: 200 }}
>
    <div
        class="bg-spooky-black border border-base-content/10 shadow-2xl rounded-2xl w-full max-w-3xl h-[80vh] max-h-[700px] flex flex-col overflow-hidden relative"
        transition:scale={{ duration: 300, start: 0.85, opacity: 0, easing: quintOut }}
    >
        <div class="font-bold text-2xl text-center m-[30px]">Create Note</div>
        <div class="m-[30px]">
            <div class="font-bold text-left">Title:</div>
            <input
                type="text"
                id="title"
                placeholder="Write a title..."
                class="input input-bordered w-full max-w-3xl"
            />
            <div class="flex flex-row items-center gap-4 pt-2">
                <div class="font-bold text-left pt-2">Tag:</div>
                <input
                    type="text"
                    id="tag"
                    placeholder="tag"
                    class="input input-bordered w-[120px] max-w-3xl"
                />
                <button
                    type="button"
                    class="btn btn-circle btn-xs btn-primary shadow-xl hover:scale-105 active:scale-95 transition-all"
                    aria-label="Add Tag"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                </button>
            </div>
        </div>
        <div class="m-[30px]">
            <div class="font-bold text-left pb-2">Content:</div>
            <textarea
                id="content"
                placeholder="Write your content..."
                class="textarea textarea-bordered w-full max-w-3xl"
            ></textarea>
        </div>
        <p class="text-center m-[60px]">Rest of input items soon</p>
        <div class="flex justify-end m-[20px]">
            <button class="btn btn-primary w-[250px] cursor-pointer">Create</button>
        </div>
    </div>
</div>
