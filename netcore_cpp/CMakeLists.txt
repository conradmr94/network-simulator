cmake_minimum_required(VERSION 3.10)
project(netcore_cpp)

set(CMAKE_CXX_STANDARD 17)

include_directories(include)

file(GLOB_RECURSE SOURCES src/*.cpp)

add_executable(netcore_cpp ${SOURCES})

