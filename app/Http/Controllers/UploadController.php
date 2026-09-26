<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'folder' => ['nullable', 'string', Rule::in(['restaurants', 'menus'])],
        ]);

        $folder = $request->string('folder', 'restaurants')->toString();
        $path = $request->file('file')->store("{$folder}/".mt_rand(2, 9), 'public');

        return response()->json([
            'url' => custom_asset('storage/'.$path),
            'path' => $path,
        ]);
    }
}
