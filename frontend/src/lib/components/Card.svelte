<script lang="ts">
    import type { Note } from '$lib/types';
    let { note }: { note: Note } = $props();
</script>

<div class="w-[400px]">
    <div
        class="card card-border bg-base-100/80 backdrop-blur-2xl border border-base-content/10 shadow-2xl w-full max-w-3xl rounded-2xl relative z-10 overflow-hidden"
    >
        <div class="card-body p-6 sm:p-10 flex flex-col gap-6">
            <h2 class="text-xl font-bold">{note.title}</h2>
            <p class="multiline">{note.content}</p>
        </div>
    </div>
</div>
