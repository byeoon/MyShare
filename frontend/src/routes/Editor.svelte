<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
</script>

<div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    transition:fade={{ duration: 200 }}
>
    <div
        class="bg-base-100 border border-base-content/10 shadow-2xl rounded-2xl w-full max-w-3xl h-[80vh] max-h-[750px] flex flex-col overflow-hidden relative"
        transition:scale={{ duration: 300, start: 0.85, opacity: 0, easing: quintOut }}
    >
        <div class="font-bold text-2xl text-center m-[30px]">Create Note</div>
        <div class="m-[30px]">
            <div class="font-bold text-left">Title</div>
            <input
                type="text"
                id="title"
                placeholder="Write a title..."
                class="input input-bordered w-[300px] max-w-3xl"
            />
        </div>
        <div class="m-[30px]">
            <div class="font-bold text-left">Content</div>
            <textarea
                id="content"
                placeholder="Write your content..."
                class="textarea textarea-bordered w-full max-w-3xl"
            ></textarea>
        </div>
        <p class="text-center m-[30px]">Rest of input items soon</p>
        <div class="flex justify-end m-[30px]">
            <button class="btn btn-primary w-[250px] cursor-pointer">Create</button>
        </div>
    </div>
</div>
