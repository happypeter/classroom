class UsersController < ApplicationController

  def login
  end

  def classroom
    @username = params[:name]
    @saved = $redis.get('username')
  end
end
