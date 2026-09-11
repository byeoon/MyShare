<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    interface Tag {
        text: string;
        color: string;
    }

    interface Note {
        id: number;
        title: string;
        content: string;
        visibility: boolean;
        tags: Tag[];
        file?: string | null;
        author?: string;
    }

    let myNotes = $state<Note[]>([]);
    let publicNotes = $state<Note[]>([]);
    let activeTab = $state<'notes' | 'public' | 'settings'>('notes'); // work in progress
    // let isLoadingMyNotes = $state(false);
    // let isLoadingPublicNotes = $state(false);

    async function loadMyNotes() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token) return;

        //   isLoadingMyNotes = true;
        try {
            const res = await fetch('/api/notes/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                    'authorization-id': userId || '',
                },
            });
            if (res.ok) {
                const data = await res.json();
                myNotes = data.notes || [];
            }
        } catch (err) {
            console.error('Failed to load user notes:', err);
        } finally {
            //    isLoadingMyNotes = false;
        }
    }

    async function loadPublicNotes() {
        //   isLoadingPublicNotes = true;
        try {
            const res = await fetch('/api/notes/public');
            if (res.ok) {
                const data = await res.json();
                publicNotes = data.notes || [];
            }
        } catch (err) {
            console.error('Failed to load public notes:', err);
        } finally {
            //  isLoadingPublicNotes = false;
        }
    }

    onMount(() => {
        loadMyNotes();
        loadPublicNotes();
    });
</script>

<div class="w-full max-w-6xl flex flex-col items-center gap-6">
    <div class="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="tabs tabs-lifted tabs-lg w-full sm:w-auto">
            <button
                type="button"
                class="tab text-base sm:text-lg font-bold h-14 cursor-pointer transition-all duration-200 active:scale-95 hover:opacity-90 [--tab-bg:var(--color-base-300)] {activeTab ===
                'notes'
                    ? 'tab-active'
                    : 'opacity-70 hover:opacity-100'}"
                onclick={() => (activeTab = 'notes')}
            >
                📝 My Notes
                <span
                    class="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-white ml-2 transition-transform duration-200 {activeTab === 'notes' ? 'scale-105' : 'scale-95 opacity-80'}"
                    >{myNotes.length}</span
                >
            </button>

            <button
                type="button"
                class="tab text-base sm:text-lg font-bold h-14 cursor-pointer transition-all duration-200 active:scale-95 hover:opacity-90 [--tab-bg:var(--color-base-300)] {activeTab ===
                'public'
                    ? 'tab-active'
                    : 'opacity-70 hover:opacity-100'}"
                onclick={() => (activeTab = 'public')}
            >
                🌐 Instance Notes
                <span
                    class="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-white ml-2 transition-transform duration-200 {activeTab === 'public' ? 'scale-105' : 'scale-95 opacity-80'}"
                    >{publicNotes.length}</span
                >
            </button>

            <button
                type="button"
                class="tab text-base sm:text-lg font-bold h-14 cursor-pointer transition-all duration-200 active:scale-95 hover:opacity-90 [--tab-bg:var(--color-base-300)] {activeTab ===
                'settings'
                    ? 'tab-active'
                    : 'opacity-70 hover:opacity-100'}"
                onclick={() => (activeTab = 'settings')}
            >
                ⚙️ Settings
            </button>
        </div>

        {#if activeTab !== 'settings'}
            <div class="w-full sm:w-72" transition:fade={{ duration: 150 }}>
                <input
                    type="text"
                    placeholder="Search notes..."
                    class="input input-bordered input-sm sm:input-md w-full bg-base-200/60 backdrop-blur-sm transition-all duration-200 focus:scale-[1.02]"
                />
            </div>
        {/if}
    </div>
</div>
